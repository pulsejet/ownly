package tlv

import (
	"bytes"
	"strings"
	"testing"

	enc "github.com/named-data/ndnd/std/encoding"
)

func testCertName() enc.Name {
	return enc.Name{enc.NewGenericComponent("test")}
}

func makeRev(reason uint8, invalidity uint64) *Revocation {
	h := make([]byte, CertHashSize)
	for i := range h {
		h[i] = byte(i)
	}
	return &Revocation{
		Reason:         reason,
		InvalidityTime: invalidity,
		CertHash:       h,
		CertName:       testCertName(),
	}
}

// Round-trip across the reason codes Ownly uses plus the Nat max edge.
func TestRevocationRoundTrip(t *testing.T) {
	for _, reason := range []uint8{0, 1, 9} {
		for _, inv := range []uint64{0, 1_700_000_000_000_000, 0xFFFFFFFFFFFFFFFF} {
			rev := makeRev(reason, inv)
			wire, err := EncodeRevocationBytes(rev)
			if err != nil {
				t.Fatalf("encode reason=%d inv=%d: %v", reason, inv, err)
			}
			if wire[0] != byte(RevocationTLVType) {
				t.Fatalf("first byte 0x%x, want 0x%x", wire[0], RevocationTLVType)
			}
			got, err := DecodeRevocationBytes(wire)
			if err != nil {
				t.Fatalf("decode: %v", err)
			}
			if got.Reason != rev.Reason || got.InvalidityTime != rev.InvalidityTime ||
				!bytes.Equal(got.CertHash, rev.CertHash) || !got.CertName.Equal(rev.CertName) {
				t.Fatalf("round-trip mismatch:\n in=%+v\nout=%+v", rev, got)
			}
		}
	}
}

func TestRevocationEncodeErrors(t *testing.T) {
	if _, err := EncodeRevocationBytes(nil); err == nil {
		t.Fatal("nil rev should error")
	}
	if _, err := EncodeRevocationBytes(&Revocation{}); err == nil {
		t.Fatal("missing fields should error")
	}
	h := make([]byte, CertHashSize)
	if _, err := EncodeRevocationBytes(&Revocation{CertHash: h}); err == nil {
		t.Fatal("empty cert name should error")
	}
	short := make([]byte, 16)
	if _, err := EncodeRevocationBytes(&Revocation{CertHash: short, CertName: testCertName()}); err == nil {
		t.Fatal("wrong-length cert hash should error")
	}
}

func TestRevocationDecodeErrors(t *testing.T) {
	w, err := EncodeRevocationBytes(makeRev(9, 0))
	if err != nil {
		t.Fatal(err)
	}
	cases := []struct {
		name string
		data []byte
	}{
		{"empty", nil},
		{"wrong outer type", []byte{0xC8, 0x00}},
		{"truncated", []byte{byte(RevocationTLVType), 0xFF, 0x01}},
		{"trailing", append(append([]byte{}, w...), 0xAA)},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			if _, err := DecodeRevocationBytes(c.data); err == nil {
				t.Fatal("expected error")
			}
		})
	}
}

func TestHashCertDeterministic(t *testing.T) {
	if HashCert([]byte("a")) != HashCert([]byte("a")) {
		t.Fatal("hash not deterministic")
	}
	if HashCert([]byte("a")) == HashCert([]byte("b")) {
		t.Fatal("hash collides for different inputs")
	}
	if h := HashCert(nil); h == "" {
		t.Fatal("nil input should produce a defined value")
	}
	if strings.Contains(HashCert([]byte("test")), "=") {
		t.Fatal("base32 should not have padding")
	}
}

func TestBuildAndParseRevocationName(t *testing.T) {
	wksp, _ := enc.NameFromStr("/wksp/foo")
	n, err := BuildRevocationName(wksp, []byte("cert"))
	if err != nil {
		t.Fatal(err)
	}
	hash, err := ParseRevocationHash(n)
	if err != nil {
		t.Fatal(err)
	}
	if hash != HashCert([]byte("cert")) {
		t.Fatalf("hash mismatch: %q vs %q", hash, HashCert([]byte("cert")))
	}
}

func TestNameBuildErrors(t *testing.T) {
	if _, err := BuildRevocationName(nil, []byte("x")); err == nil {
		t.Fatal("empty wksp should error")
	}
	wksp, _ := enc.NameFromStr("/wksp")
	if _, err := BuildRevocationName(wksp, nil); err == nil {
		t.Fatal("empty cert should error")
	}
}

func TestParseRevocationHashErrors(t *testing.T) {
	if _, err := ParseRevocationHash(nil); err == nil {
		t.Fatal("nil should error")
	}
	if _, err := ParseRevocationHash(enc.Name{}); err == nil {
		t.Fatal("empty should error")
	}
	n, _ := enc.NameFromStr("/a/b/c")
	if _, err := ParseRevocationHash(n); err == nil {
		t.Fatal("no-version should error")
	}
}
