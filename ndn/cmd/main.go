//go:build js && wasm

package main

import (
	"syscall/js"

	jsutil "github.com/named-data/ndnd/std/utils/js"
	"github.com/pulsejet/ownly/ndn/app"
)

func main() {
	var me *app.App
	if js.Global().Get("window").IsUndefined() {
		me = app.NewNodeApp()
	} else {
		me = app.NewApp()
	}

	api := map[string]any{
		// has_testbed_key(): Promise<boolean>;
		"has_testbed_key": jsutil.AsyncFunc(func(this js.Value, p []js.Value) (any, error) {
			return me.GetTestbedKey() != nil, nil
		}),

		// connect_testbed(): Promise<void>;
		"connect_testbed": jsutil.AsyncFunc(func(this js.Value, p []js.Value) (any, error) {
			return nil, me.ConnectTestbed()
		}),

		// ndncert_email(email: string, code: (status: string) => Promise<string>): Promise<void>;
		"ndncert_email": jsutil.AsyncFunc(func(this js.Value, p []js.Value) (any, error) {
			return nil, me.NdncertEmail(p[0].String(), func(status string) string {
				code, err := jsutil.Await(p[1].Invoke(status))
				if err != nil {
					return ""
				}
				return code.String()
			})
		}),

		// create_workspace(name: string): Promise<string>;
		"create_workspace": jsutil.AsyncFunc(func(this js.Value, p []js.Value) (any, error) {
			return me.CreateWorkspace(p[0].String())
		}),

		// get_workspace(name: string): Promise<WorkspaceAPI>;
		"get_workspace": jsutil.AsyncFunc(func(this js.Value, p []js.Value) (any, error) {
			return me.GetWorkspace(p[0].String())
		}),
	}

	js.Global().Call("set_ndn", js.ValueOf(api))
	<-make(chan struct{})
}
