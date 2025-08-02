//go:build js && wasm

package app

import (
	"fmt"
	"time"

	enc "github.com/named-data/ndnd/std/encoding"
	"github.com/named-data/ndnd/std/log"
	"github.com/named-data/ndnd/std/ndn"
	spec "github.com/named-data/ndnd/std/ndn/spec_2022"
	"github.com/named-data/ndnd/std/types/optional"
	"github.com/named-data/ndnd/std/utils"
)

type Awareness struct {
	Group  enc.Name
	Name   enc.Name
	Client ndn.Client
	OnData func(enc.Wire)
}

func (a *Awareness) String() string {
	return "Awareness"
}

func (a *Awareness) Start() error {
	return a.Client.Engine().AttachHandler(a.Group, func(args ndn.InterestHandlerArgs) {
		if a.OnData == nil {
			return
		}

		if args.Interest.AppParam() == nil {
			log.Debug(a, "no AppParam, ignoring")
			return
		}

		data, sigCov, err := spec.Spec{}.ReadData(enc.NewWireView(args.Interest.AppParam()))
		if err != nil {
			log.Warn(a, "failed to parse SyncData", "err", err)
			return
		}

		a.Client.Validate(data, sigCov, func(valid bool, err error) {
			if !valid || err != nil {
				log.Warn(a, "failed to validate signature", "name", data.Name(), "valid", valid, "err", err)
				return
			}
			a.OnData(data.Content())
		})
	})
}

func (a *Awareness) Stop() error {
	return a.Client.Engine().DetachHandler(a.Group)
}

func (a *Awareness) Publish(content enc.Wire) error {
	signer := a.Client.SuggestSigner(a.Name)
	if signer == nil {
		return fmt.Errorf("failed to find valid signer")
	}

	dataName := a.Name.WithVersion(enc.VersionUnixMicro)
	dataCfg := &ndn.DataConfig{
		ContentType: optional.Some(ndn.ContentTypeBlob),
	}
	data, err := a.Client.Engine().Spec().MakeData(dataName, dataCfg, content, signer)
	if err != nil {
		return fmt.Errorf("failed to make data: %w", err)
	}

	intCfg := &ndn.InterestConfig{
		Lifetime: optional.Some(1 * time.Second),
		Nonce:    utils.ConvertNonce(a.Client.Engine().Timer().Nonce()),
	}
	interest, err := a.Client.Engine().Spec().MakeInterest(a.Group, intCfg, data.Wire, nil)
	if err != nil {
		return fmt.Errorf("failed to make interest: %w", err)
	}

	// Don't care about the result
	err = a.Client.Engine().Express(interest, nil)
	if err != nil {
		return fmt.Errorf("failed to express interest: %w", err)
	}

	return nil
}
