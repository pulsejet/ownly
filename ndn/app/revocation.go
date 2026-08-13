// Per-workspace revocation state.
//
// The state lives in memory only; revocations are re-received from
// SVS on workspace reopen. Three indexes, all guarded by RWMutex:
//   - revokedByCertName   drop check by cert NDN name
//   - revokedByHash       backfill when cert arrives after revocation
//   - revokedByPublisher  drop check by SVS publisher name
//
// Latest-wins on SVS sequence number so out-of-order deliveries
// never clobber a newer record.

package app

import (
	"sync"
	"time"

	enc "github.com/named-data/ndnd/std/encoding"
	"github.com/pulsejet/ownly/ndn/app/tlv"
)

type RevocationRecord struct {
	Reason         uint8
	InvalidityTime uint64
	CertHash       []byte
	Publisher      enc.Name
	BootTime       uint64
	SeqNum         uint64
	ReceivedAt     time.Time
}

type revocationState struct {
	mu                  sync.RWMutex
	revokedByCertName   map[string]*RevocationRecord
	revokedByHash       map[string]*RevocationRecord
	revokedByPublisher  map[string]*RevocationRecord
}

func newRevocationState() *revocationState {
	return &revocationState{
		revokedByCertName:  make(map[string]*RevocationRecord),
		revokedByHash:      make(map[string]*RevocationRecord),
		revokedByPublisher: make(map[string]*RevocationRecord),
	}
}

func (s *revocationState) isRevoked(certName enc.Name) bool {
	if s == nil {
		return false
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	_, ok := s.revokedByCertName[certName.TlvStr()]
	return ok
}

func (s *revocationState) publisherIsRevoked(publisher enc.Name) bool {
	if s == nil {
		return false
	}
	if publisher.TlvStr() == "" {
		return false
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	_, ok := s.revokedByPublisher[publisher.TlvStr()]
	return ok
}

// record stores a revocation. Refuses to overwrite a record with a
// higher stored SVS sequence number. If certName is empty (the
// cert is not in our keychain yet), only the by-hash index is
// populated; the by-name and by-publisher indexes are filled in by
// resolvePendingByHash when the cert later arrives.
func (s *revocationState) record(rec *RevocationRecord, certName enc.Name) {
	if s == nil {
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	if len(certName) > 0 {
		key := certName.TlvStr()
		if existing, ok := s.revokedByCertName[key]; ok && existing.SeqNum > rec.SeqNum {
			return
		}
		s.revokedByCertName[key] = rec
		if pub, ok := extractPublisher(certName); ok {
			s.revokedByPublisher[pub] = rec
		}
	}
	if len(rec.CertHash) > 0 {
		s.revokedByHash[string(rec.CertHash)] = rec
	}
}

func (s *revocationState) resolvePendingByHash(certName enc.Name, certWire []byte) (*RevocationRecord, bool) {
	if s == nil || len(certName) == 0 || len(certWire) == 0 {
		return nil, false
	}
	hashBytes := tlv.HashCertBytes(certWire)
	s.mu.Lock()
	defer s.mu.Unlock()
	rec, ok := s.revokedByHash[string(hashBytes)]
	if !ok {
		return nil, false
	}
	if len(rec.CertHash) == 0 {
		rec.CertHash = hashBytes
	}
	s.revokedByCertName[certName.TlvStr()] = rec
	if pub, ok := extractPublisher(certName); ok {
		s.revokedByPublisher[pub] = rec
	}
	return rec, true
}

func (s *revocationState) pendingByHash(certHash []byte) (*RevocationRecord, bool) {
	if s == nil {
		return nil, false
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	rec, ok := s.revokedByHash[string(certHash)]
	return rec, ok
}

func (s *revocationState) list() []*RevocationRecord {
	if s == nil {
		return nil
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]*RevocationRecord, 0, len(s.revokedByCertName))
	for _, rec := range s.revokedByCertName {
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
	out := make([]revocationListEntry, 0, len(s.revokedByCertName))
	for nameStr, rec := range s.revokedByCertName {
		name, err := enc.NameFromTlvStr(nameStr)
		if err != nil {
			// State corruption: skip rather than panic. The next
			// receive will repopulate the index.
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

// extractPublisher returns the SVS publisher portion of a cert
// name: everything before the `KEY` component.
func extractPublisher(certName enc.Name) (string, bool) {
	if len(certName) == 0 {
		return "", false
	}
	for i, comp := range certName {
		if string(comp.Val) == "KEY" && i > 0 {
			return certName[:i].TlvStr(), true
		}
	}
	return "", false
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
		"cert_hash":       tlv.HashBytesToBase32(rec.CertHash),
		"cert_name":       certNameStr,
		"publisher":       rec.Publisher.String(),
		"boot_time":       int(rec.BootTime),
		"seq_num":         int(rec.SeqNum),
		"received_at":     time.Now().UnixMicro(),
	}
}
