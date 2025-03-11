/// <reference types="golang-wasm-exec" />

import * as Y from 'yjs';

import { StoreDexie, type StoreJS } from '@/services/database/store_js';
import { KeyChainDexie, type KeyChainJS } from '@/services/database/keychain_js';
import { GlobalBus } from '@/services/event-bus';

/* eslint-disable no-var */
declare global {
  var _ndnd_store_js: StoreJS;
  var _ndnd_keychain_js: KeyChainJS;
  var _yjs_merge_updates: (updates: Uint8Array[]) => Uint8Array;
  var _ndnd_conn_change_js: (connected: boolean, router: string) => void;
  var _ndnd_conn_state: { connected: boolean; router: string };

  var set_ndn: undefined | ((ndn: NDNAPI) => void);
  var ndn_api: NDNAPI;
}
/* eslint-enable no-var */

interface NDNAPI {
  /** Check if there is a valid testbed key in the keychain */
  has_testbed_key(): Promise<boolean>;

  /** Connect to the global NDN testbed */
  connect_testbed(): Promise<void>;

  /** NDNCERT email verfication challenge */
  ndncert_email(email: string, code: (status: string) => Promise<string>): Promise<void>;

  /** Create new workspace */
  create_workspace(name: string): Promise<string>;

  /** Get an existing workspace */
  get_workspace(name: string): Promise<WorkspaceAPI>;
}

export interface WorkspaceAPI {
  /** Name of this user / node */
  name: string;
  /** Overall prefix of workspace */
  group: string;

  /** Start the workspace */
  start(): Promise<void>;
  /** Stop the workspace */
  stop(): Promise<void>;

  /** Produce an NDN object under a given name */
  produce(name: string, data: Uint8Array): Promise<void>;
  /** Consume an NDN object with a name */
  consume(name: string): Promise<{ data: Uint8Array; name: string }>;

  /** SVS ALO instance */
  svs_alo(
    group: string,
    state: Uint8Array | undefined,
    persist_state: (state: Uint8Array) => Promise<void>,
  ): Promise<SvsAloApi>;
  /** Awareness instance */
  awareness(group: string): Promise<AwarenessApi>;
}

/** API of the SVS ALO instance */
export interface SvsAloApi {
  /** Sync prefix of the instance */
  sync_prefix: string;
  /** Data prefix of the instance */
  data_prefix: string;

  /** Start the SVS instance */
  start(): Promise<void>;
  /** Stop the SVS instance */
  stop(): Promise<void>;
  /** Set the error callback */
  set_on_error(): Promise<void>;

  /** Publish chat message to SVS ALO */
  pub_yjs_delta(uuid: string, binary: Uint8Array): Promise<void>;
  /** Publish blob fetch command */
  pub_blob_fetch(name: string): Promise<string>;

  /** Set SVS ALO subscription callbacks */
  subscribe(params: {
    on_yjs_delta: SvsAloSub<{ uuid: string; binary: Uint8Array }>;
  }): Promise<void>;
}

/** Subscription to SVS ALO */
export type SvsAloSub<T> = (pub: T[]) => Promise<void>;

/** Metadata of received publication */
export type SvsAloPubInfo = {
  publisher: string;
  boot_time: number;
  seq_num: number;
};

/** API for Awareness */
export interface AwarenessApi {
  /** Start the awareness */
  start(): Promise<void>;
  /** Stop the awareness */
  stop(): Promise<void>;
  /** Publish new data */
  publish(data: Uint8Array): Promise<void>;
  /** Subscribe to data */
  subscribe(cb: (pub: Uint8Array) => void): Promise<void>;
}

/**
 * Named Data Networking Service
 */
class NDNService {
  public api!: NDNAPI;

  constructor() {}

  async setup() {
    if (this.api) return;

    // Provide JS APIs
    globalThis._ndnd_store_js = new StoreDexie('store');
    globalThis._ndnd_keychain_js = new KeyChainDexie();
    globalThis._yjs_merge_updates = Y.mergeUpdatesV2;
    globalThis._ndnd_conn_change_js = _ndnd_conn_change_js;
    globalThis._ndnd_conn_state = { connected: false, router: String() };

    // Load the Go WASM module
    const go = new Go();
    let result: WebAssembly.WebAssemblyInstantiatedSource;

    if (typeof window !== 'undefined') {
      result = await WebAssembly.instantiateStreaming(fetch('/main.wasm'), go.importObject);
    } else {
      const fsImport = 'fs/promises';
      const fs = await import(/* @vite-ignore */ fsImport);
      // @ts-expect-error - relative path to wasm
      const buffer = await fs.readFile(import.meta.dirname + '/../../main.wasm');
      result = await WebAssembly.instantiate(buffer, go.importObject);
    }

    // Callback given by WebAssembly to set the NDN API
    const ndnPromise = new Promise<NDNAPI>((resolve, reject) => {
      const cancel = setTimeout(() => reject(new Error('NDN API not set')), 5000);
      globalThis.set_ndn = (ndn: NDNAPI) => {
        globalThis.set_ndn = undefined;
        globalThis.ndn_api = ndn;
        resolve(ndn);
        clearTimeout(cancel);
      };
    });

    go.run(result.instance).then(() => {
      GlobalBus.emit(
        'wksp-error',
        new Error('WASM backend crashed. Check JS console for logs and refresh the page.'),
      );
    });
    this.api = await ndnPromise;
  }
}

function _ndnd_conn_change_js(connected: boolean, router: string) {
  try {
    router = new URL(router).host;
  } catch {}
  try {
    globalThis._ndnd_conn_state = { connected, router };
    GlobalBus.emit('conn-change');
  } catch {}
}

export default new NDNService();
