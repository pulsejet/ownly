//go:build js && wasm

package app

import (
	"fmt"
	"os"
	"time"

	enc "github.com/named-data/ndnd/std/encoding"
	"github.com/named-data/ndnd/std/security/ndncert"
	spec_ndncert "github.com/named-data/ndnd/std/security/ndncert/tlv"
)

func (a *App) NdncertEmail(email string, CodeCb func(status string) string) (err error) {
	// Connect to the testbed
	if err := a.WaitForConnectivity(time.Second * 5); err != nil {
		return err
	}

	// Create NDNCERT client
	certClient, err := ndncert.NewClient(a.engine, testbedRootCert)
	if err != nil {
		return err
	}

	// Request a certificate from NDNCERT
	certRes, err := certClient.RequestCert(ndncert.RequestCertArgs{
		Challenge: &ndncert.ChallengeEmail{
			Email:        email,
			CodeCallback: CodeCb,
		},
		OnProfile: func(profile *spec_ndncert.CaProfile) error {
			fmt.Fprintf(os.Stderr, "NDNCERT CA: %s\n", profile.CaInfo)
			return nil
		},
		OnProbeParam: func(key string) ([]byte, error) {
			switch key {
			case ndncert.KwEmail:
				return []byte(email), nil
			default:
				return nil, fmt.Errorf("unknown probe key: %s", key)
			}
		},
		OnChooseKey: func(suggestions []enc.Name) int {
			return 0 // choose the first key
		},
		OnKeyChosen: func(keyName enc.Name) error {
			fmt.Fprintf(os.Stderr, "Certifying key: %s\n", keyName)
			return nil
		},
	})
	if err != nil {
		return err
	}

	// Verfiy the received certificate and fetch the chain
	_, err = a.verifyTestbedCert(certRes.CertWire, true)
	if err != nil {
		return fmt.Errorf("failed to verify issued certificate: %w", err)
	}

	// Store the certificate and the signer key
	if err = a.keychain.InsertKey(certRes.Signer); err != nil {
		return err
	}
	if err = a.keychain.InsertCert(certRes.CertWire.Join()); err != nil {
		return err
	}

	return nil
}
