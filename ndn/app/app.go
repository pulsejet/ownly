//go:build js && wasm

package app

import (
	"syscall/js"

	"github.com/named-data/ndnd/std/ndn"
	"github.com/named-data/ndnd/std/object/storage"
	"github.com/named-data/ndnd/std/security/keychain"
)

type App struct {
	face     ndn.Face
	engine   ndn.Engine
	store    ndn.Store
	keychain ndn.KeyChain
}

var _ndnd_store_js = js.Global().Get("_ndnd_store_js")
var _ndnd_keychain_js = js.Global().Get("_ndnd_keychain_js")

// function(connected: boolean, router: string): void
var _ndnd_conn_change_js = js.Global().Get("_ndnd_conn_change_js")

func NewApp() *App {
	store := storage.NewJsStore(_ndnd_store_js)

	kc, err := keychain.NewKeyChainJS(_ndnd_keychain_js, store)
	if err != nil {
		panic(err)
	}

	return &App{
		store:    store,
		keychain: kc,
	}
}

func NewNodeApp() *App {
	store := storage.NewMemoryStore()

	kc, err := keychain.NewKeyChainDir("./keychain", store)
	if err != nil {
		panic(err)
	}

	return &App{
		store:    store,
		keychain: kc,
	}
}
