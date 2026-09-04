//go:build js && wasm

// Revocation App methods: pending-apply, cert demote, JS callback,
// publish path, and the Phase 5 SecurityConfig re-shoot stub.

package app

import (
	"fmt"

	enc "github.com/named-data/ndnd/std/encoding"
	"github.com/named-data/ndnd/std/log"
	spec "github.com/named-data/ndnd/std/ndn/spec_2022"
	ndn_sync "github.com/named-data/ndnd/std/sync"
	"github.com/pulsejet/ownly/ndn/app/tlv"
)

const reasonKeyCompromise uint8 = 1

// applyPendingRevocations demotes a newly-inserted cert if a pending
// revocation matches its hash. Call after any cert insert path.
func (a *App) applyPendingRevocations(certName enc.Name, certWire []byte) {
	if a == nil || a.bootSyncSession == nil || a.bootSyncSession.revokedCerts == nil {
		return
	}
	if !tlv.IsWkspKeyCertName(certName) {
		return
	}
	rec, ok := a.bootSyncSession.revokedCerts.lookupByHash(tlv.HashCertBytes(certWire))
	if !ok {
		return
	}
	if err := a.demoteCert(certName); err != nil {
		log.Warn(nil, "Failed to demote cert on retroactive revocation", "cert", certName, "err", err)
		return
	}
	a.emitCertRevoked(certName, rec)
}

// demoteCert marks the cert untrusted. The cert stays in the local
// store so list_identity_keys still returns the peer row (the
// [REVOKED] badge in WorkspaceMembers needs the row). Trust
// validation goes through the keychain, which is deleted.
//
// TODO: the keychain delete path belongs to ndnd; once the upstream
// revoke branch is merged, switch to a keychain-side revocation
// store rather than deleting + retaining the cert locally.
func (a *App) demoteCert(certName enc.Name) error {
	if a.store == nil {
		return fmt.Errorf("store not initialized")
	}
	_, err := a.store.Get(certName, false)
	known := err == nil
	if a.keychain != nil {
		_ = a.keychain.DeleteCert(certName)
	}
	if !known {
		return fmt.Errorf("cert not in local store: %s", certName)
	}
	return nil
}

// emitCertRevoked invokes the JS on_cert_revoked callback if set.
func (a *App) emitCertRevoked(certName enc.Name, rec *RevocationRecord) {
	if a == nil || rec == nil {
		return
	}
	if a.certRevokedCb.IsUndefined() || a.certRevokedCb.IsNull() {
		return
	}
	a.certRevokedCb.Invoke(certName.String(), certRevokedPayload(certName, rec))
}

// publishRevocationToAlo is the single publish path. Called by the
// pub_revocation JS API, the top-level revoke_cert JS API, and the
// owner-side fast-join eph revoke.
//
// When reason is keyCompromise (1) and invalidityTime is 0, the cert
// is parsed to use its NotBefore as the effective invalidity time
// (RFC 5280 §5.3.2). Parse failure logs and falls through to 0.
func publishRevocationToAlo(
	alo *ndn_sync.SvsALO,
	wkspName enc.Name,
	certName enc.Name,
	certWire enc.Wire,
	reason uint8,
	invalidityTime uint64,
) (string, enc.Wire, error) {
	certBytes := certWire.Join()
	if len(certBytes) == 0 {
		return "", nil, fmt.Errorf("cert wire bytes are empty")
	}
	if len(certName) == 0 {
		return "", nil, fmt.Errorf("cert name is empty")
	}
	if !tlv.IsWkspKeyCertName(certName) {
		return "", nil, fmt.Errorf("can only revoke wkspKey certs (path must contain /wksp/ and /KEY/), got %s", certName)
	}
	effective := invalidityTime
	if reason == reasonKeyCompromise && effective == 0 {
		certData, _, parseErr := spec.Spec{}.ReadData(enc.NewWireView(certWire))
		if parseErr != nil {
			log.Warn(nil, "keyCompromise default: cert parse failed; falling through to InvalidityTime=0", "err", parseErr)
		} else if certData.Signature() != nil {
			if nb, _ := certData.Signature().Validity(); nb.IsSet() {
				effective = uint64(nb.Unwrap().UnixMicro())
			}
		}
	}
	rev := &tlv.Revocation{
		Reason:         reason,
		InvalidityTime: effective,
		CertHash:       tlv.HashCertBytes(certBytes),
		CertName:       certName,
	}
	tlvBytes, err := tlv.EncodeRevocationBytes(rev)
	if err != nil {
		return "", nil, fmt.Errorf("encode revocation: %w", err)
	}
	_, state, err := alo.Publish(enc.Wire{tlvBytes})
	if err != nil {
		return "", nil, fmt.Errorf("publish revocation: %w", err)
	}
	revName, err := tlv.BuildRevocationName(wkspName, certBytes)
	if err != nil {
		log.Warn(nil, "Failed to build canonical revocation name", "err", err)
		return certName.String(), state, nil
	}
	return revName.String(), state, nil
}

// reshootSecurityConfig is the post-revoke repo sync stub. The owner
// re-shoots SecurityConfig after every revoke so repos joined later
// see the up-to-date revocation set. The field shape is TBD, so
// this logs and returns; v2 wires the actual publishSecurityConfig.
func (a *App) reshootSecurityConfig() {
	if a == nil {
		return
	}
	log.Info(a, "Reshoot SecurityConfig (stub)")
}

// handleRevocationPub processes a SVS publication that may be a
// Revocation record (0xD4 first byte). Returns true if the pub was
// handled (caller should continue to the next pub). Any SVS group
// member may publish a revocation; the only structural filter is the
// wkspKey target check (IsWkspKeyCertName). Publisher authorization
// is enforced upstream via trust_config keylocator validation (see
// the follow-up cert-store refactor). Unknown-cert revocations are
// accepted and resolved when the cert arrives via
// applyPendingRevocations.
func (a *App) handleRevocationPub(pub ndn_sync.SvsPub) bool {
	contentBytes := pub.Content.Join()
	if len(contentBytes) == 0 || contentBytes[0] != byte(tlv.RevocationTLVType) {
		return false
	}
	rev, err := tlv.DecodeRevocationBytes(contentBytes)
	if err != nil {
		log.Warn(nil, "Failed to decode revocation", "err", err)
		return true
	}
	if !tlv.IsWkspKeyCertName(rev.CertName) {
		log.Warn(nil, "Rejecting revocation: target is not a wkspKey",
			"name", rev.CertName)
		return true
	}
	rec := &RevocationRecord{
		Reason:         rev.Reason,
		InvalidityTime: rev.InvalidityTime,
		CertHash:       rev.CertHash,
		CertName:       rev.CertName,
	}
	if a.bootSyncSession != nil && a.bootSyncSession.revokedCerts != nil {
		a.bootSyncSession.revokedCerts.record(rec)
	}
	if demoteErr := a.demoteCert(rev.CertName); demoteErr != nil {
		log.Info(nil, "Cached revocation for unknown cert", "name", rev.CertName, "err", demoteErr)
	} else {
		a.emitCertRevoked(rev.CertName, rec)
	}
	return true
}
