package app

import (
	"sync"
	"testing"

	enc "github.com/named-data/ndnd/std/encoding"
	"github.com/pulsejet/ownly/ndn/app/tlv"
)

func mkRec(reason uint8, hash []byte, seq uint64) *RevocationRecord {
	return &RevocationRecord{
		Reason:   reason,
		CertHash: hash,
		SeqNum:   seq,
	}
}

// Latest-wins on SVS sequence number. Out-of-order deliveries
// never clobber a newer record.
func TestRecordLatestWins(t *testing.T) {
	s := newRevocationState()
	n, _ := enc.NameFromStr("/cert")
	s.record(mkRec(9, []byte{1}, 5), n)
	s.record(mkRec(5, []byte{2}, 3), n) // lower seq, must not overwrite
	if s.list()[0].Reason != 9 {
		t.Fatal("lower seq overwrote higher seq")
	}
	s.record(mkRec(1, []byte{3}, 7), n) // higher seq, must take over
	if s.list()[0].Reason != 1 {
		t.Fatal("higher seq did not take over")
	}
}

// A revocation received before the cert is in the keychain must
// resolve to the by-name + by-publisher indexes when the cert later
// arrives.
func TestResolvePendingByHash(t *testing.T) {
	s := newRevocationState()
	n, _ := enc.NameFromStr("/alice/KEY/kid/v=1")
	h := tlv.HashCertBytes([]byte("wire"))
	s.record(mkRec(9, h, 1), enc.Name{}) // empty cert name: pending only
	if s.isRevoked(n) {
		t.Fatal("cert name should not be revoked yet")
	}
	rec, ok := s.resolvePendingByHash(n, []byte("wire"))
	if !ok {
		t.Fatal("pending record should resolve")
	}
	if !s.isRevoked(n) {
		t.Fatal("cert name should be revoked after resolve")
	}
	if !s.publisherIsRevoked(mustName(t, "/alice")) {
		t.Fatal("publisher should be revoked after resolve")
	}
	_ = rec
}

func TestPublisherExtraction(t *testing.T) {
	cases := []struct {
		in, want string
	}{
		{"/alice/KEY/kid/v=1", "/alice"},
		{"/bob/device/KEY/k2/v=2", "/bob/device"},
		{"/no-key-here", ""}, // no KEY component -> no publisher
	}
	for _, c := range cases {
		got, _ := extractPublisher(mustName(t, c.in))
		want := ""
		if c.want != "" {
			want = mustName(t, c.want).TlvStr()
		}
		if got != want {
			t.Errorf("extractPublisher(%q) = %q, want %q", c.in, got, want)
		}
	}
}

func TestStateConcurrent(t *testing.T) {
	s := newRevocationState()
	n, _ := enc.NameFromStr("/c")
	var wg sync.WaitGroup
	for i := 0; i < 50; i++ {
		wg.Add(2)
		go func(i int) {
			defer wg.Done()
			s.record(mkRec(uint8(i), []byte{byte(i)}, uint64(i)), n)
		}(i)
		go func() {
			defer wg.Done()
			_ = s.isRevoked(n)
		}()
	}
	wg.Wait()
}

func mustName(t *testing.T, s string) enc.Name {
	t.Helper()
	n, err := enc.NameFromStr(s)
	if err != nil {
		t.Fatal(err)
	}
	return n
}
