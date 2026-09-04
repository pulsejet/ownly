// Per-workspace revocation state.
//
// The state lives in memory only; revocations are re-received from
// SVS on workspace reopen. One index, keyed by CertName, all guarded
// by RWMutex.
//
// v2: dropped the 3-map (certName / hash / publisher) design from v1
// in favor of a single map. The "negative cert" pattern is gone:
// revocation is just a record in this map. Pubs signed by a revoked
// cert fail to validate against the keychain (which had its trust
// anchor deleted in demoteCert), so the drop-check at workspace.go
// is unnecessary in the normal case. We keep a hash lookup for the
// applyPendingRevocations path (cert inserted after revocation).

package app

import (
	"sync"

	enc "github.com/named-data/ndnd/std/encoding"
)

type RevocationRecord struct {
	Reason         uint8
	InvalidityTime uint64
	CertHash       []byte
	CertName       enc.Name
}

type revocationState struct {
	mu      sync.RWMutex
	revoked map[string]*RevocationRecord
}

func newRevocationState() *revocationState {
	return &revocationState{
		revoked: make(map[string]*RevocationRecord),
	}
}

// record stores a revocation, overwriting any prior record for the
// same CertName. The map is the source of truth; re-records refresh
// the same entry.
func (s *revocationState) record(rec *RevocationRecord) {
	if s == nil || rec == nil {
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	s.revoked[rec.CertName.TlvStr()] = rec
}

func (s *revocationState) isRevoked(certName enc.Name) bool {
	if s == nil {
		return false
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	_, ok := s.revoked[certName.TlvStr()]
	return ok
}

// lookupByHash finds a pending revocation for a cert that just arrived,
// by its SHA-256 hash. Returns the record + true if found.
func (s *revocationState) lookupByHash(hash []byte) (*RevocationRecord, bool) {
	if s == nil || len(hash) == 0 {
		return nil, false
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	for _, rec := range s.revoked {
		if bytesEq(rec.CertHash, hash) {
			return rec, true
		}
	}
	return nil, false
}

func bytesEq(a, b []byte) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}

// list returns all revocations in arbitrary order.
func (s *revocationState) list() []*RevocationRecord {
	if s == nil {
		return nil
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]*RevocationRecord, 0, len(s.revoked))
	for _, rec := range s.revoked {
		out = append(out, rec)
	}
	return out
}

// listWithName pairs each record with the cert name it was stored
// under. Used by list_revocations to surface cert_name in the JS payload.
func (s *revocationState) listWithName() []revocationListEntry {
	if s == nil {
		return nil
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]revocationListEntry, 0, len(s.revoked))
	for nameStr, rec := range s.revoked {
		name, err := enc.NameFromTlvStr(nameStr)
		if err != nil {
			continue
		}
		out = append(out, revocationListEntry{Name: name, Rec: rec})
	}
	return out
}

type revocationListEntry struct {
	Name enc.Name
	Rec  *RevocationRecord
}

// certRevokedPayload builds the JS-callback payload for a revocation.
func certRevokedPayload(certName enc.Name, rec *RevocationRecord) map[string]any {
	certNameStr := ""
	if len(certName) > 0 {
		certNameStr = certName.String()
	}
	return map[string]any{
		"reason":          int(rec.Reason),
		"invalidity_time": int(rec.InvalidityTime),
		"cert_hash":       encHex(rec.CertHash),
		"cert_name":       certNameStr,
	}
}

// encHex hex-encodes a byte slice for JSON transport. Using hex
// instead of the old base32 (the cert hash is opaque to the UI).
func encHex(b []byte) string {
	const hex = "0123456789abcdef"
	if len(b) == 0 {
		return ""
	}
	out := make([]byte, len(b)*2)
	for i, c := range b {
		out[i*2] = hex[c>>4]
		out[i*2+1] = hex[c&0x0F]
	}
	return string(out)
}
