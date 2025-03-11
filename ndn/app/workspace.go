//go:build js && wasm

package app

import (
	"crypto/elliptic"
	"fmt"
	"syscall/js"
	"time"

	spec_repo "github.com/named-data/ndnd/repo/tlv"
	enc "github.com/named-data/ndnd/std/encoding"
	"github.com/named-data/ndnd/std/log"
	"github.com/named-data/ndnd/std/ndn"
	spec "github.com/named-data/ndnd/std/ndn/spec_2022"
	"github.com/named-data/ndnd/std/ndn/svs_ps"
	"github.com/named-data/ndnd/std/object"
	"github.com/named-data/ndnd/std/security"
	sig "github.com/named-data/ndnd/std/security/signer"
	ndn_sync "github.com/named-data/ndnd/std/sync"
	jsutil "github.com/named-data/ndnd/std/utils/js"
	"github.com/pulsejet/ownly/ndn/app/tlv"
)

const SnapshotThreshold = 100

var repoName, _ = enc.NameFromStr("/ndnd/ucla/repo")

// CreateWorkspace creates a new workspace with the given name.
func (a *App) CreateWorkspace(nameStr string) (nameStrFinal string, err error) {
	name, err := enc.NameFromStr(nameStr)
	if err != nil {
		return
	}
	nameStrFinal = name.String()

	keyName := security.MakeKeyName(name)
	signer, err := sig.KeygenEcc(keyName, elliptic.P256())
	if err != nil {
		return
	}
	if err = a.keychain.InsertKey(signer); err != nil {
		return
	}

	// Create self-signed certificate trust anchor
	cert, err := security.SelfSign(security.SignCertArgs{
		Signer:    signer,
		NotBefore: time.Now().Add(-time.Hour),
		NotAfter:  time.Now().Add(time.Hour * 24 * 365 * 10), // 10 years
	})
	if err != nil {
		return
	}
	if err = a.keychain.InsertCert(cert.Join()); err != nil {
		return
	}

	return
}

// GetWorkspace returns a JS object representing the workspace with the given name.
func (a *App) GetWorkspace(groupStr string) (api js.Value, err error) {
	group, err := enc.NameFromStr(groupStr)
	if err != nil {
		return
	}

	// Get name of this node
	key := a.GetTestbedKey()
	if key == nil {
		err = fmt.Errorf("no testbed key")
		return
	}

	// Use testbed key to sign NFD management commands
	a.SetCmdKey(key)
	name := key.KeyName().Prefix(-2) // pop KeyId and KEY

	// Create client object for this workspace
	client := object.NewClient(a.engine, a.store, nil)

	var workspaceJs map[string]any
	workspaceJs = map[string]any{
		// name: string;
		"name": js.ValueOf(name.String()),

		// group: string;
		"group": js.ValueOf(group.String()),

		// start(): Promise<void>;
		"start": jsutil.AsyncFunc(func(this js.Value, p []js.Value) (any, error) {
			if err := client.Start(); err != nil {
				return nil, err
			}
			return nil, nil
		}),

		// stop(): Promise<void>;
		"stop": jsutil.AsyncFunc(func(this js.Value, p []js.Value) (any, error) {
			if err := client.Stop(); err != nil {
				return nil, err
			}

			jsutil.ReleaseMap(workspaceJs)
			return nil, nil
		}),

		// produce(name: string, data: Uint8Array): Promise<void>;
		"produce": jsutil.AsyncFunc(func(this js.Value, p []js.Value) (any, error) {
			name, err := enc.NameFromStr(p[0].String())
			if err != nil {
				return nil, err
			}

			_, err = client.Produce(ndn.ProduceArgs{
				Name:    name,
				Content: enc.Wire{jsutil.JsArrayToSlice(p[1])},
			})

			return nil, err
		}),

		// consume(name: string): Promise<{ data: Uint8Array; name: string; }>;
		"consume": jsutil.AsyncFunc(func(this js.Value, p []js.Value) (any, error) {
			name, err := enc.NameFromStr(p[0].String())
			if err != nil {
				return nil, err
			}

			// Fetch the content from the network
			ch := make(chan ndn.ConsumeState)
			client.ConsumeExt(ndn.ConsumeExtArgs{
				Name:     name,
				TryStore: true,
				Callback: func(state ndn.ConsumeState) { ch <- state },
			})
			state := <-ch
			if err := state.Error(); err != nil {
				return nil, err
			}

			return js.ValueOf(map[string]any{
				"data": jsutil.SliceToJsArray(state.Content().Join()),
				"name": js.ValueOf(state.Name().String()),
			}), nil
		}),

		// svs_alo(group: string, state: Uint8Array | undefined, persist_state: (state: Uint8Array) => Promise<void>): Promise<SvsAloApi>;
		"svs_alo": jsutil.AsyncFunc(func(this js.Value, p []js.Value) (any, error) {
			svsAloGroup, err := enc.NameFromStr(p[0].String())
			if err != nil {
				return nil, err
			}

			// Parse initial state
			var stateWire enc.Wire = nil
			if !p[1].IsUndefined() {
				stateWire = enc.Wire{jsutil.JsArrayToSlice(p[1])}
			}

			// Create new SVS ALO instance
			svsAlo, err := ndn_sync.NewSvsALO(ndn_sync.SvsAloOpts{
				Name:         name,
				InitialState: stateWire,

				Svs: ndn_sync.SvSyncOpts{
					Client:      client,
					GroupPrefix: svsAloGroup,
				},

				Snapshot: &ndn_sync.SnapshotNodeHistory{
					Client:    client,
					Threshold: SnapshotThreshold,
					Compress:  CompressSnapshotYjs,
				},
			})
			if err != nil {
				return nil, err
			}

			// Create JS API for SVS ALO
			return a.SvsAloJs(client, svsAlo, p[2]), nil
		}),

		// awareness(group: string): Promise<AwarenessApi>;
		"awareness": jsutil.AsyncFunc(func(this js.Value, p []js.Value) (any, error) {
			awarenessGroup, err := enc.NameFromStr(p[0].String())
			if err != nil {
				return nil, err
			}

			// Create new Awareness instance
			return a.AwarenessJs(&Awareness{
				Name:   awarenessGroup,
				Client: client,
			}), nil
		}),
	}

	return js.ValueOf(workspaceJs), nil
}

func (a *App) SvsAloJs(client ndn.Client, alo *ndn_sync.SvsALO, persistState js.Value) (api js.Value) {
	routes := []enc.Name{
		alo.SyncPrefix(),
		alo.DataPrefix(),
	}

	var svsAloJs map[string]any
	svsAloJs = map[string]any{
		"sync_prefix": js.ValueOf(alo.SyncPrefix().String()),
		"data_prefix": js.ValueOf(alo.DataPrefix().String()),

		// start(): Promise<void>;
		"start": jsutil.AsyncFunc(func(this js.Value, p []js.Value) (any, error) {
			// Announce prefixes to the network
			for _, route := range routes {
				client.AnnouncePrefix(ndn.Announcement{
					Name:   route,
					Expose: true,
					OnError: func(err error) {
						// TODO: show error to the user, use a global bus hook
					},
				})
			}

			// Notify repo to start
			a.NotifyRepo(client, alo.GroupPrefix())

			if err := alo.Start(); err != nil {
				return nil, err
			}

			return nil, nil
		}),

		// stop(): Promise<void>;
		"stop": jsutil.AsyncFunc(func(this js.Value, p []js.Value) (any, error) {
			if err := alo.Stop(); err != nil {
				return nil, err
			}

			for _, route := range routes {
				client.WithdrawPrefix(route, nil)
			}

			jsutil.ReleaseMap(svsAloJs)
			return nil, nil
		}),

		// set_on_error(): Promise<void>;
		"set_on_error": js.FuncOf(func(this js.Value, p []js.Value) any {
			alo.SetOnError(func(err error) {
				p[0].Invoke(js.ValueOf(err.Error()))
			})
			return nil
		}),

		// pub_yjs_delta(binary: Uint8Array): Promise<void>;
		"pub_yjs_delta": jsutil.AsyncFunc(func(this js.Value, p []js.Value) (any, error) {
			pub := &tlv.Message{
				YjsDelta: &tlv.YjsDelta{
					UUID:   p[0].String(),
					Binary: jsutil.JsArrayToSlice(p[1]),
				},
			}

			name, state, err := alo.Publish(pub.Encode())
			if err != nil {
				return nil, err
			}

			// Persist state
			jsutil.Await(persistState.Invoke(jsutil.SliceToJsArray(state.Join())))

			return js.ValueOf(name.String()), nil
		}),

		// pub_blob_fetch(name: string): Promise<string>;
		"pub_blob_fetch": jsutil.AsyncFunc(func(this js.Value, p []js.Value) (any, error) {
			// This message is special, in the sense that it is purely intended for repo.
			// So subscribers will never see this message.
			blobName, err := enc.NameFromStr(p[0].String())
			if err != nil {
				return nil, err
			}
			cmd := spec_repo.RepoCmd{
				BlobFetch: &spec_repo.BlobFetch{
					Name: &spec.NameContainer{Name: blobName},
				},
			}
			blobName, state, err := alo.Publish(cmd.Encode())
			if err != nil {
				return nil, err
			}

			// Persist state
			jsutil.Await(persistState.Invoke(jsutil.SliceToJsArray(state.Join())))

			return js.ValueOf(blobName.String()), nil
		}),

		// subscribe(name: string, { on_yjs_delta }): Promise<void>;
		"subscribe": jsutil.AsyncFunc(func(this js.Value, p []js.Value) (any, error) {
			// Send a list of publications to the JS callback
			sendPub := func(pubs []ndn_sync.SvsPub) {
				yjsDeltas := js.Global().Get("Array").New()

				for _, pub := range pubs {
					pmsg, err := tlv.ParseMessage(enc.NewWireView(pub.Content), true)
					if err != nil {
						log.Error(nil, "Failed to parse publication", "err", err)
						continue
					}

					// All possible message type conversions listed here
					switch {
					case pmsg.YjsDelta != nil:
						yjsDeltas.Call("push", js.ValueOf(map[string]any{
							"uuid":   pmsg.YjsDelta.UUID,
							"binary": jsutil.SliceToJsArray(pmsg.YjsDelta.Binary),
						}))
					default:
						// This will be logged even for BlobFetch commands, which is fine
						// (can be fixed but avoid the extra parse that is unused)
						log.Warn(nil, "Ignoring unknown message")
					}
				}

				if yjsDeltas.Get("length").Int() > 0 {
					jsutil.Await(p[0].Get("on_yjs_delta").Invoke(yjsDeltas))
				}
			}

			// Subscribe to the SVS instance
			alo.SubscribePublisher(enc.Name{}, func(pub ndn_sync.SvsPub) {
				if !pub.IsSnapshot {
					sendPub([]ndn_sync.SvsPub{pub})
				} else {
					snapshot, err := svs_ps.ParseHistorySnap(enc.NewWireView(pub.Content), true)
					if err != nil {
						panic(err) // we encode this, so this never happens
					}

					pubs := make([]ndn_sync.SvsPub, 0, len(snapshot.Entries))
					for _, entry := range snapshot.Entries {
						pubs = append(pubs, ndn_sync.SvsPub{
							Publisher: pub.Publisher,
							Content:   entry.Content,
							BootTime:  pub.BootTime,
							SeqNum:    entry.SeqNo,
						})
					}
					sendPub(pubs)
				}

				// Persist state
				jsutil.Await(persistState.Invoke(jsutil.SliceToJsArray(pub.State.Join())))

				return
			})
			return nil, nil
		}),
	}
	return js.ValueOf(svsAloJs)
}

func (a *App) AwarenessJs(awareness *Awareness) (api js.Value) {
	// Create JS API for Awareness
	var awarenessJs map[string]any
	awarenessJs = map[string]any{
		// start(): Promise<void>;
		"start": jsutil.AsyncFunc(func(this js.Value, p []js.Value) (any, error) {
			awareness.Start()
			return nil, nil
		}),

		// stop(): Promise<void>;
		"stop": jsutil.AsyncFunc(func(this js.Value, p []js.Value) (any, error) {
			awareness.Stop()
			jsutil.ReleaseMap(awarenessJs)
			return nil, nil
		}),

		// publish(data: Uint8Array): Promise<void>;
		"publish": jsutil.AsyncFunc(func(this js.Value, p []js.Value) (any, error) {
			return nil, awareness.Publish(enc.Wire{jsutil.JsArrayToSlice(p[0])})
		}),

		// subscribe(cb: (pub: Uint8Array) => void): Promise<void>;
		"subscribe": jsutil.AsyncFunc(func(this js.Value, p []js.Value) (any, error) {
			awareness.OnData = func(wire enc.Wire) {
				p[0].Invoke(jsutil.SliceToJsArray(wire.Join()))
			}
			return nil, nil
		}),
	}
	return js.ValueOf(awarenessJs)
}

func (a *App) NotifyRepo(client ndn.Client, group enc.Name) {
	// If the face is not running, wait for it to come up
	if !a.face.IsRunning() {
		var cancel func()
		cancel = a.face.OnUp(func() {
			go a.NotifyRepo(client, group)
			cancel()
		})
		return
	}

	// Notify repo to join SVS group
	repoCmd := spec_repo.RepoCmd{
		SyncJoin: &spec_repo.SyncJoin{
			Protocol: &spec.NameContainer{Name: spec_repo.SyncProtocolSvsV3},
			Group:    &spec.NameContainer{Name: group},
			HistorySnapshot: &spec_repo.HistorySnapshotConfig{
				Threshold: SnapshotThreshold,
			},
		},
	}
	client.ExpressCommand(
		repoName.Append(enc.NewKeywordComponent("cmd")),
		repoCmd.Encode(),
		func(w enc.Wire, err error) {
			if err != nil {
				log.Warn(nil, "Repo sync join command failed", "group", group, "err", err)
			} else {
				log.Info(nil, "Repo joined SVS group", "group", group)
			}
		})
}
