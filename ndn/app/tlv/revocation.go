// Revocation TLV codec, hash, and canonical name.
//
// Wire format (type 0xD4, body has 4 sub-TLVs, all even/non-critical):
//   0x0106 Reason         uint8   (RFC 5280 §5.3.1: 0/1/5/9 in v1)
//   0x0108 InvalidityTime uint64  (RFC 5280 §5.3.2; 0 = "now")
//   0x010A CertHash       [32]byte (SHA-256 of cert wire bytes)
//   0x010C CertName       enc.Name (raw components, no 0x07 wrapper)
//
// Standalone (not in zz_generated.go) so the wire format is frozen
// without re-running gondn_tlv_gen. The struct lives in definitions.go.
//
// CertHash is in the body because the SVS ALO wrapper overwrites
// the data name with `<group>/<node>/<boot>/<seq>/v=0`, so the
// receiver cannot recover the canonical name from the publication
// alone. CertName is in the body (per round-3 mentor feedback) so
// receivers do not need a hash→cert lookup.

package tlv

import (
	"crypto/sha256"
	"encoding/base32"
	"fmt"

	enc "github.com/named-data/ndnd/std/encoding"
)

const (
	RevocationTLVType       enc.TLNum = 0xD4
	reasonFieldType         enc.TLNum = 0x0106
	invalidityTimeFieldType enc.TLNum = 0x0108
	certHashFieldType       enc.TLNum = 0x010A
	certNameFieldType       enc.TLNum = 0x010C
	CertHashSize                     = 32
)

func nameEncodingLength(name enc.Name) int {
	n := 0
	for _, c := range name {
		n += c.EncodingLength()
	}
	return n
}

// EncodeRevocationBytes serializes a Revocation record.
func EncodeRevocationBytes(rev *Revocation) ([]byte, error) {
	if rev == nil {
		return nil, fmt.Errorf("revocation is nil")
	}
	if len(rev.CertHash) != CertHashSize {
		return nil, fmt.Errorf("cert hash length = %d, want %d", len(rev.CertHash), CertHashSize)
	}
	if len(rev.CertName) == 0 {
		return nil, fmt.Errorf("cert name is empty")
	}
	reasonBytes := enc.Nat(uint64(rev.Reason)).Bytes()
	invBytes := enc.Nat(rev.InvalidityTime).Bytes()
	hashBytes := rev.CertHash
	nameWireLen := nameEncodingLength(rev.CertName)
	bodyLen := 0
	bodyLen += reasonFieldType.EncodingLength() + enc.TLNum(len(reasonBytes)).EncodingLength() + len(reasonBytes)
	bodyLen += invalidityTimeFieldType.EncodingLength() + enc.TLNum(len(invBytes)).EncodingLength() + len(invBytes)
	bodyLen += certHashFieldType.EncodingLength() + enc.TLNum(len(hashBytes)).EncodingLength() + len(hashBytes)
	bodyLen += certNameFieldType.EncodingLength() + enc.TLNum(nameWireLen).EncodingLength() + nameWireLen

	buf := make([]byte, RevocationTLVType.EncodingLength()+enc.TLNum(bodyLen).EncodingLength()+bodyLen)
	pos := 0
	pos += RevocationTLVType.EncodeInto(buf[pos:])
	pos += enc.TLNum(bodyLen).EncodeInto(buf[pos:])
	pos += reasonFieldType.EncodeInto(buf[pos:])
	pos += enc.TLNum(len(reasonBytes)).EncodeInto(buf[pos:])
	copy(buf[pos:], reasonBytes)
	pos += len(reasonBytes)
	pos += invalidityTimeFieldType.EncodeInto(buf[pos:])
	pos += enc.TLNum(len(invBytes)).EncodeInto(buf[pos:])
	copy(buf[pos:], invBytes)
	pos += len(invBytes)
	pos += certHashFieldType.EncodeInto(buf[pos:])
	pos += enc.TLNum(len(hashBytes)).EncodeInto(buf[pos:])
	copy(buf[pos:], hashBytes)
	pos += len(hashBytes)
	pos += certNameFieldType.EncodeInto(buf[pos:])
	pos += enc.TLNum(nameWireLen).EncodeInto(buf[pos:])
	for _, c := range rev.CertName {
		pos += c.EncodeInto(buf[pos:])
	}
	return buf, nil
}

// DecodeRevocationBytes parses a Revocation record. Input must start
// with the Revocation TLV type and contain nothing else.
func DecodeRevocationBytes(data []byte) (*Revocation, error) {
	if len(data) == 0 {
		return nil, fmt.Errorf("empty input")
	}
	reader := enc.NewBufferView(data)
	typ, err := reader.ReadTLNum()
	if err != nil {
		return nil, fmt.Errorf("read type: %w", err)
	}
	if typ != RevocationTLVType {
		return nil, fmt.Errorf("expected Revocation type 0x%x, got 0x%x", uint64(RevocationTLVType), uint64(typ))
	}
	length, err := reader.ReadTLNum()
	if err != nil {
		return nil, fmt.Errorf("read length: %w", err)
	}
	endPos := reader.Pos() + int(length)
	if endPos > reader.Length() {
		return nil, fmt.Errorf("truncated: declared body is %d bytes, only %d remaining", length, reader.Length()-reader.Pos())
	}
	if endPos < reader.Length() {
		return nil, fmt.Errorf("trailing data: %d unconsumed bytes after Revocation body", reader.Length()-endPos)
	}

	rev := &Revocation{}

	subTyp, err := reader.ReadTLNum()
	if err != nil {
		return nil, fmt.Errorf("read reason type: %w", err)
	}
	if subTyp != reasonFieldType {
		return nil, fmt.Errorf("expected reason type 0x%x, got 0x%x", uint64(reasonFieldType), uint64(subTyp))
	}
	reasonLen, err := reader.ReadTLNum()
	if err != nil {
		return nil, fmt.Errorf("read reason length: %w", err)
	}
	reasonBuf := make([]byte, reasonLen)
	if _, err := reader.ReadFull(reasonBuf); err != nil {
		return nil, fmt.Errorf("read reason value: %w", err)
	}
	reasonVal, _, err := enc.ParseNat(reasonBuf)
	if err != nil {
		return nil, fmt.Errorf("parse reason: %w", err)
	}
	rev.Reason = uint8(reasonVal)

	subTyp, err = reader.ReadTLNum()
	if err != nil {
		return nil, fmt.Errorf("read invalidity time type: %w", err)
	}
	if subTyp != invalidityTimeFieldType {
		return nil, fmt.Errorf("expected invalidity time type 0x%x, got 0x%x", uint64(invalidityTimeFieldType), uint64(subTyp))
	}
	invLen, err := reader.ReadTLNum()
	if err != nil {
		return nil, fmt.Errorf("read invalidity time length: %w", err)
	}
	invBuf := make([]byte, invLen)
	if _, err := reader.ReadFull(invBuf); err != nil {
		return nil, fmt.Errorf("read invalidity time value: %w", err)
	}
	invVal, _, err := enc.ParseNat(invBuf)
	if err != nil {
		return nil, fmt.Errorf("parse invalidity time: %w", err)
	}
	rev.InvalidityTime = uint64(invVal)

	subTyp, err = reader.ReadTLNum()
	if err != nil {
		return nil, fmt.Errorf("read cert hash type: %w", err)
	}
	if subTyp != certHashFieldType {
		return nil, fmt.Errorf("expected cert hash type 0x%x, got 0x%x", uint64(certHashFieldType), uint64(subTyp))
	}
	hashLen, err := reader.ReadTLNum()
	if err != nil {
		return nil, fmt.Errorf("read cert hash length: %w", err)
	}
	if hashLen != CertHashSize {
		return nil, fmt.Errorf("cert hash length = %d, want %d", hashLen, CertHashSize)
	}
	rev.CertHash = make([]byte, hashLen)
	if _, err := reader.ReadFull(rev.CertHash); err != nil {
		return nil, fmt.Errorf("read cert hash value: %w", err)
	}

	subTyp, err = reader.ReadTLNum()
	if err != nil {
		return nil, fmt.Errorf("read cert name type: %w", err)
	}
	if subTyp != certNameFieldType {
		return nil, fmt.Errorf("expected cert name type 0x%x, got 0x%x", uint64(certNameFieldType), uint64(subTyp))
	}
	nameLen, err := reader.ReadTLNum()
	if err != nil {
		return nil, fmt.Errorf("read cert name length: %w", err)
	}
	nameView := reader.Delegate(int(nameLen))
	rev.CertName, err = nameView.ReadName()
	if err != nil {
		return nil, fmt.Errorf("read cert name: %w", err)
	}
	if len(rev.CertName) == 0 {
		return nil, fmt.Errorf("cert name is empty")
	}

	if reader.Pos() != endPos {
		return nil, fmt.Errorf("internal: consumed %d bytes, expected %d", reader.Pos(), endPos)
	}
	return rev, nil
}

// HashCert returns base32(SHA256(cert-wire-bytes)) with no `=` padding.
func HashCert(certWireBytes []byte) string {
	sum := sha256.Sum256(certWireBytes)
	return base32.StdEncoding.WithPadding(base32.NoPadding).EncodeToString(sum[:])
}

// HashCertBytes returns the raw 32-byte SHA-256 of the cert wire bytes.
func HashCertBytes(certWireBytes []byte) []byte {
	sum := sha256.Sum256(certWireBytes)
	return sum[:]
}

// HashBytesToBase32 base32-encodes the given bytes (no padding).
func HashBytesToBase32(b []byte) string {
	return base32.StdEncoding.WithPadding(base32.NoPadding).EncodeToString(b)
}

// BuildRevocationName constructs /<wksp>/boot/REVOKE/<hash>/v=<unix-us>.
// Use BuildRevocationNameWithVersion for deterministic tests.
func BuildRevocationName(wkspName enc.Name, certWireBytes []byte) (enc.Name, error) {
	return BuildRevocationNameWithVersion(wkspName, certWireBytes, enc.VersionUnixMicro)
}

func BuildRevocationNameWithVersion(wkspName enc.Name, certWireBytes []byte, version uint64) (enc.Name, error) {
	if wkspName == nil || len(wkspName) == 0 {
		return nil, fmt.Errorf("workspace name is empty")
	}
	if len(certWireBytes) == 0 {
		return nil, fmt.Errorf("cert wire bytes are empty")
	}
	return wkspName.
		Append(enc.NewKeywordComponent("boot")).
		Append(enc.NewKeywordComponent("REVOKE")).
		Append(enc.NewGenericComponent(HashCert(certWireBytes))).
		WithVersion(version), nil
}

// ParseRevocationHash extracts the base32 hash from a revocation name.
// Name must end in a version component.
func ParseRevocationHash(name enc.Name) (string, error) {
	if name == nil || len(name) == 0 {
		return "", fmt.Errorf("name is empty")
	}
	if !name.At(-1).IsVersion() {
		return "", fmt.Errorf("name does not end in a version component")
	}
	idx := len(name) - 2
	if idx < 0 {
		return "", fmt.Errorf("name too short: %d components", len(name))
	}
	return string(name[idx].Val), nil
}
