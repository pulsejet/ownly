//go:build !js || !wasm

// End-to-end test for the revocation flow at the data-structure level:
// TLV encode → name build → state record → hash lookup. The WASM-only
// publish + receive paths are covered by the manual 2-device test the
// user runs; this file covers everything the WASM layer is built on.

package app

import (
	"testing"

	enc "github.com/named-data/ndnd/std/encoding"
	"github.com/pulsejet/ownly/ndn/app/tlv"
)

// Reason code values from RFC 5280 §5.3.1. The TLV codec has no
// enum constant for them, so we name the ones we use here.
const reasonPrivilegeWithdrawn uint8 = 9

func mkWkspKeyName() enc.Name {
	n, _ := enc.NameFromStr("/alice@example.com/wksp/alice@example.com/KEY/k1/self/v=1")
	return n
}

func mkIdKeyName() enc.Name {
	n, _ := enc.NameFromStr("/alice@example.com/KEY/k1/identity/v=1")
	return n
}

// Full encode → decode roundtrip with a wkspKey target, verifying
// the wkspKey gate fires for the right input and the cert-name
// component round-trips intact.
func TestRevocationWkspKeyRoundtrip(t *testing.T) {
	rev := &tlv.Revocation{
		Reason:         reasonPrivilegeWithdrawn,
		InvalidityTime: 1_700_000_000_000_000,
		CertHash:       tlv.HashCertBytes([]byte("cert wire bytes")),
		CertName:       mkWkspKeyName(),
	}
	wire, err := tlv.EncodeRevocationBytes(rev)
	if err != nil {
		t.Fatalf("encode: %v", err)
	}
	got, err := tlv.DecodeRevocationBytes(wire)
	if err != nil {
		t.Fatalf("decode: %v", err)
	}
	if !tlv.IsWkspKeyCertName(got.CertName) {
		t.Fatalf("decoded name is not a wkspKey: %s", got.CertName)
	}
	if !got.CertName.Equal(rev.CertName) {
		t.Fatalf("cert name mismatch:\n in=%s\nout=%s", rev.CertName, got.CertName)
	}
	if !bytesEq(got.CertHash, rev.CertHash) {
		t.Fatalf("cert hash mismatch")
	}
	if got.Reason != rev.Reason || got.InvalidityTime != rev.InvalidityTime {
		t.Fatalf("reason/invalidity mismatch")
	}
}

// The same Revocation body with an idKey cert name should be rejected
// at the wkspKey gate even if it round-trips through the codec.
// (The publish/receive path applies the gate before accepting.)
func TestRevocationIdKeyRejected(t *testing.T) {
	rev := &tlv.Revocation{
		Reason:   reasonPrivilegeWithdrawn,
		CertHash: tlv.HashCertBytes([]byte("cert wire bytes")),
		CertName: mkIdKeyName(),
	}
	wire, err := tlv.EncodeRevocationBytes(rev)
	if err != nil {
		t.Fatalf("encode: %v", err)
	}
	got, err := tlv.DecodeRevocationBytes(wire)
	if err != nil {
		t.Fatalf("decode: %v", err)
	}
	if tlv.IsWkspKeyCertName(got.CertName) {
		t.Fatalf("idKey name should not pass wkspKey check: %s", got.CertName)
	}
}

// BuildRevocationName pins the v2 wire format: the cert-hash
// component is GenericNameComponent (type 0x08) carrying the raw
// 32-byte SHA-256 of the cert wire bytes (not base32), and the
// version component is NDN Timestamp (type 0x38) with 8 bytes of
// big-endian unix-microseconds.
func TestBuildRevocationNameMatchesV2Spec(t *testing.T) {
	wksp, _ := enc.NameFromStr("/wksp/foo")
	const ts uint64 = 1_700_000_000_000_000
	certWire := []byte("the cert wire bytes")
	n, err := tlv.BuildRevocationNameWithVersion(wksp, certWire, ts)
	if err != nil {
		t.Fatalf("build: %v", err)
	}
	if got := len(n); got != 6 {
		t.Fatalf("name has %d components, want 6 (/wksp/foo + 32=boot + 32=REVOKE + hash + ts)", got)
	}
	hashComp := n[4]
	if hashComp.Typ != enc.TypeGenericNameComponent {
		t.Fatalf("hash component type 0x%x, want 0x%x", hashComp.Typ, enc.TypeGenericNameComponent)
	}
	if len(hashComp.Val) != tlv.CertHashSize {
		t.Fatalf("hash component length %d, want %d", len(hashComp.Val), tlv.CertHashSize)
	}
	if !bytesEq(hashComp.Val, tlv.HashCertBytes(certWire)) {
		t.Fatalf("hash component does not match SHA-256 of cert wire bytes")
	}
	tsComp := n[5]
	if tsComp.Typ != enc.TypeTimestampNameComponent {
		t.Fatalf("timestamp component type 0x%x, want 0x%x", tsComp.Typ, enc.TypeTimestampNameComponent)
	}
	if len(tsComp.Val) != 8 {
		t.Fatalf("timestamp component value length %d, want 8 (big-endian unix-us)", len(tsComp.Val))
	}
	want := uint64(1_700_000_000_000_000)
	got := uint64(0)
	for _, b := range tsComp.Val {
		got = (got << 8) | uint64(b)
	}
	if got != want {
		t.Fatalf("timestamp value 0x%x, want 0x%x", got, want)
	}
}

// State record + lookup by hash exercises the same path
// applyPendingRevocations uses when a cert arrives after its
// revocation has already been cached.
func TestStateRecordAndLookupByHash(t *testing.T) {
	s := newRevocationState()
	wkspKey := mkWkspKeyName()
	certWire := []byte("some cert wire bytes")
	hash := tlv.HashCertBytes(certWire)

	// Simulate handleRevocationPub recording the revocation for an
	// unknown cert.
	rec := &RevocationRecord{
		Reason:         reasonPrivilegeWithdrawn,
		InvalidityTime: 0,
		CertHash:       hash,
		CertName:       wkspKey,
	}
	s.record(rec)

	// Simulate applyPendingRevocations being called when the cert
	// later arrives in the keychain.
	got, ok := s.lookupByHash(hash)
	if !ok {
		t.Fatal("lookupByHash should find the record by cert wire SHA-256")
	}
	if !got.CertName.Equal(wkspKey) {
		t.Fatalf("cert name mismatch: got %s, want %s", got.CertName, wkspKey)
	}
	if got.Reason != reasonPrivilegeWithdrawn {
		t.Fatalf("reason mismatch: got %d, want %d", got.Reason, reasonPrivilegeWithdrawn)
	}

	// A different cert (different hash) should not be found.
	if _, ok := s.lookupByHash(tlv.HashCertBytes([]byte("other cert"))); ok {
		t.Fatal("lookupByHash should miss a different cert hash")
	}
}

// list_revocations in app.go returns the cert hash as hex (encHex),
// not base32. The JS payload shape is what the WorkspaceMembers
// component renders. This test pins the encoding on the Go side.
func TestRevocationCertHashHexEncoding(t *testing.T) {
	hash := tlv.HashCertBytes([]byte("the cert"))
	if len(hash) != tlv.CertHashSize {
		t.Fatalf("hash length %d, want %d", len(hash), tlv.CertHashSize)
	}
	hex := encHex(hash)
	if len(hex) != tlv.CertHashSize*2 {
		t.Fatalf("hex length %d, want %d (2 chars per byte)", len(hex), tlv.CertHashSize*2)
	}
	// Spot-check: the encHex encoding must agree with what tlv.EncodeRevocationBytes
	// would put in the CertHash field. (If these ever diverge, the JS
	// payload's cert_hash will not match the Go-side SHA-256, and the
	// lookupByHash path will silently miss.)
	hashFromHex := make([]byte, tlv.CertHashSize)
	for i := 0; i < tlv.CertHashSize; i++ {
		var hi, lo byte
		switch hex[i*2] {
		case '0', '1', '2', '3', '4', '5', '6', '7', '8', '9':
			hi = hex[i*2] - '0'
		case 'a', 'b', 'c', 'd', 'e', 'f':
			hi = hex[i*2] - 'a' + 10
		}
		switch hex[i*2+1] {
		case '0', '1', '2', '3', '4', '5', '6', '7', '8', '9':
			lo = hex[i*2+1] - '0'
		case 'a', 'b', 'c', 'd', 'e', 'f':
			lo = hex[i*2+1] - 'a' + 10
		}
		hashFromHex[i] = (hi << 4) | lo
	}
	if !bytesEq(hashFromHex, hash) {
		t.Fatalf("hex roundtrip disagrees with original hash")
	}
	// All chars must be lowercase hex.
	for i, c := range hex {
		if !((c >= '0' && c <= '9') || (c >= 'a' && c <= 'f')) {
			t.Fatalf("non-hex char %q at index %d in %q", c, i, hex)
		}
	}
}
