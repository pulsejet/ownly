package app

import (
	"sync"
	"testing"

	enc "github.com/named-data/ndnd/std/encoding"
)

func mkRec(reason uint8, hash []byte, seq uint64) *RevocationRecord {
	return &RevocationRecord{
		Reason:   reason,
		CertHash: hash,
		CertName: enc.Name{},
	}
}

// record overwrites the prior entry; re-recording with the same name
// replaces the value.
func TestRecordOverwrites(t *testing.T) {
	s := newRevocationState()
	n, _ := enc.NameFromStr("/a/b/KEY/k1/self/v=1")
	rec := &RevocationRecord{
		Reason:   9,
		CertName: n,
		CertHash: []byte{0x01, 0x02, 0x03},
	}
	s.record(rec)
	rec2 := &RevocationRecord{
		Reason:   5,
		CertName: n,
		CertHash: []byte{0x04, 0x05, 0x06},
	}
	s.record(rec2)
	got := s.list()
	if len(got) != 1 {
		t.Fatalf("len = %d, want 1", len(got))
	}
	if got[0].Reason != 5 {
		t.Fatalf("Reason = %d, want 5", got[0].Reason)
	}
	if got[0].CertHash[0] != 0x04 {
		t.Fatalf("CertHash = %x, want 04...", got[0].CertHash)
	}
}

func TestIsRevoked(t *testing.T) {
	s := newRevocationState()
	n, _ := enc.NameFromStr("/a/b/KEY/k1/self/v=1")
	s.record(&RevocationRecord{CertName: n})
	if !s.isRevoked(n) {
		t.Fatal("expected isRevoked true after record")
	}
	other, _ := enc.NameFromStr("/a/b/KEY/k2/self/v=1")
	if s.isRevoked(other) {
		t.Fatal("expected isRevoked false for unrecorded name")
	}
}

func TestLookupByHash(t *testing.T) {
	s := newRevocationState()
	n, _ := enc.NameFromStr("/a/b/KEY/k1/self/v=1")
	hash := []byte{0x01, 0x02, 0x03, 0x04}
	s.record(&RevocationRecord{CertName: n, CertHash: hash})
	if rec, ok := s.lookupByHash(hash); !ok || rec.CertName.String() != n.String() {
		t.Fatalf("lookupByHash returned ok=%v, want true", ok)
	}
	missing := []byte{0x09, 0x09, 0x09, 0x09}
	if _, ok := s.lookupByHash(missing); ok {
		t.Fatal("lookupByHash returned true for absent hash")
	}
}

func TestListWithName(t *testing.T) {
	s := newRevocationState()
	n1, _ := enc.NameFromStr("/a/b/KEY/k1/self/v=1")
	n2, _ := enc.NameFromStr("/a/b/KEY/k2/self/v=1")
	s.record(&RevocationRecord{CertName: n1, Reason: 9})
	s.record(&RevocationRecord{CertName: n2, Reason: 5})
	out := s.listWithName()
	if len(out) != 2 {
		t.Fatalf("listWithName len = %d, want 2", len(out))
	}
	seen := map[string]uint8{}
	for _, e := range out {
		seen[e.Name.String()] = e.Rec.Reason
	}
	if seen[n1.String()] != 9 {
		t.Fatalf("n1 reason = %d, want 9", seen[n1.String()])
	}
	if seen[n2.String()] != 5 {
		t.Fatalf("n2 reason = %d, want 5", seen[n2.String()])
	}
}

func TestNilSafety(t *testing.T) {
	var s *revocationState
	if s.isRevoked(enc.Name{}) {
		t.Fatal("nil state should return false")
	}
	if _, ok := s.lookupByHash([]byte{1}); ok {
		t.Fatal("nil state lookupByHash should return false")
	}
	if s.list() != nil {
		t.Fatal("nil state list should return nil")
	}
	if s.listWithName() != nil {
		t.Fatal("nil state listWithName should return nil")
	}
}

func TestStateConcurrent(t *testing.T) {
	s := newRevocationState()
	var wg sync.WaitGroup
	for i := 0; i < 50; i++ {
		wg.Add(2)
		go func(i int) {
			defer wg.Done()
			n, _ := enc.NameFromStr("/a/b/KEY/k1/self/v=" + itoa(i))
			s.record(&RevocationRecord{CertName: n, Reason: uint8(i % 256)})
		}(i)
		go func() {
			defer wg.Done()
			_ = s.list()
		}()
	}
	wg.Wait()
}

func itoa(i int) string {
	// minimal local itoa to avoid importing strconv just for tests
	if i == 0 {
		return "0"
	}
	var buf [20]byte
	pos := len(buf)
	for i > 0 {
		pos--
		buf[pos] = byte('0' + i%10)
		i /= 10
	}
	return string(buf[pos:])
}
