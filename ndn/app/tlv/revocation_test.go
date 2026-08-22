package tlv

import (
	"bytes"
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

func TestHashCertBytesDeterministic(t *testing.T) {
	if !bytes.Equal(HashCertBytes([]byte("a")), HashCertBytes([]byte("a"))) {
		t.Fatal("hash not deterministic")
	}
	if bytes.Equal(HashCertBytes([]byte("a")), HashCertBytes([]byte("b"))) {
		t.Fatal("hash collides for different inputs")
	}
	if h := HashCertBytes(nil); len(h) != CertHashSize {
		t.Fatalf("nil input should produce a %d-byte hash, got %d", CertHashSize, len(h))
	}
}

func TestBuildRevocationNameRawBytes(t *testing.T) {
	wksp, _ := enc.NameFromStr("/wksp/foo")
	const ts uint64 = 1_700_000_000_000_000
	n, err := BuildRevocationNameWithVersion(wksp, []byte("cert"), ts)
	if err != nil {
		t.Fatal(err)
	}
	if got := len(n); got != 6 {
		t.Fatalf("name has %d components, want 6 (wksp, foo, 32=boot, 32=REVOKE, hash, ts)", got)
	}
	hashComp := n[4]
	if hashComp.Typ != enc.TypeGenericNameComponent {
		t.Fatalf("hash component type = 0x%x, want 0x%x", hashComp.Typ, enc.TypeGenericNameComponent)
	}
	if len(hashComp.Val) != CertHashSize {
		t.Fatalf("hash component length = %d, want %d", len(hashComp.Val), CertHashSize)
	}
	if !bytes.Equal(hashComp.Val, HashCertBytes([]byte("cert"))) {
		t.Fatal("hash component does not match SHA256 of cert wire")
	}
	tsComp := n[5]
	if tsComp.Typ != enc.TypeTimestampNameComponent {
		t.Fatalf("timestamp component type = 0x%x, want 0x%x", tsComp.Typ, enc.TypeTimestampNameComponent)
	}
	if tsComp.Val == nil {
		t.Fatal("timestamp component value is nil")
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

func TestIsWkspKeyCertName(t *testing.T) {
	cases := []struct {
		in   string
		want bool
	}{
		// accepted (wkspKey variants)
		{"/alice@example.com/wksp/alice@example.com/KEY/k1/self/v=1", true},
		{"/alice@example.com/wksp/alice@example.com/KEY/k1/anchor/v=1", true},
		{"/alice@example.com/wksp/alice@example.com/KEY/k1/pre/v=1", true},
		{"/wksp/bob/KEY/k2/pre/v=1", true},
		{"/wksp/32=owner/KEY/k1/anchor/v=1", true},
		// rejected (idKey, partial, etc.)
		{"/alice@example.com/KEY/k1/identity/v=1", false},
		{"/alice@example.com/KEY/k1/identity/v=1/IDCERT", false},
		{"", false},
		{"/alice", false},
		{"/alice/wksp", false},
		{"/alice/wksp/KEY", false},
		{"/wksp/no-key-here/v=1", false},
	}
	for _, c := range cases {
		n, err := enc.NameFromStr(c.in)
		if err != nil {
			t.Fatalf("parse %q: %v", c.in, err)
		}
		// Pin the enc.NameFromStr behavior IsWkspKeyCertName relies on:
		// the components holding the literal tokens "wksp" and "KEY"
		// must be parseable via string(c.Val). enc.NameFromStr parses
		// these as either GenericNameComponent (0x08) or, in
		// names like "/32=owner/...", KeywordNameComponent (0x20).
		// The helper must handle BOTH encodings. If a future ndn-go
		// release changes this, IsWkspKeyCertName silently breaks.
		for i, comp := range n {
			val := string(comp.Val)
			if val == "wksp" || val == "KEY" {
				if comp.Typ != enc.TypeGenericNameComponent && comp.Typ != enc.TypeKeywordNameComponent {
					t.Errorf("comp %d of %q (val=%q) parsed as type 0x%x; expected 0x08 (Generic) or 0x20 (Keyword) for IsWkspKeyCertName's value-based check",
						i, c.in, val, comp.Typ)
				}
			}
		}
		got := IsWkspKeyCertName(n)
		if got != c.want {
			t.Errorf("IsWkspKeyCertName(%q) = %v, want %v", c.in, got, c.want)
		}
	}
}
