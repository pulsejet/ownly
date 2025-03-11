import * as Y from 'yjs';
import * as awareProto from 'y-protocols/awareness.js';

import * as utils from '@/utils';

import type { AwarenessApi, SvsAloApi, WorkspaceAPI } from '@/services/ndn';
import type { AwarenessLocalState } from '@/services/types';
import type { ProjDb } from '@/services/database/proj_db';

/**
 * Yjs documents backed by an SVS sync group.
 */
export class SvsProvider {
  private readonly docs = new Map<string, Y.Doc>();
  private readonly aware = new Map<string, awareProto.Awareness>();

  private readonly persistDirty = new Set<string>();
  private lastCompaction = 0;
  private isCompacting = false;

  private constructor(
    private readonly db: ProjDb,
    private readonly wksp: WorkspaceAPI,
    private readonly svs: SvsAloApi,
  ) {}

  /**
   * Create a new SVS provider for a project.
   *
   * @param wksp Workspace API
   * @param project Project name
   */
  public static async create(wksp: WorkspaceAPI, project: string): Promise<SvsProvider> {
    const slug = utils.escapeUrlName(wksp.group);
    const db = new _o.ProjDb(`${slug}-${project}`);

    const istate = await db.stateGet('svs');
    const svs = await wksp.svs_alo(
      `${wksp.group}/${project}`,
      istate,
      async (state: Uint8Array) => {
        await db.statePut('svs', state);
      },
    );

    const provider = new SvsProvider(db, wksp, svs);
    await provider.start();

    return provider;
  }

  /**
   * Destroy the provider.
   * This will stop the SVS instance and clean up all documents.
   */
  public async destroy() {
    for (const doc of this.docs.values()) {
      doc.destroy();
    }
    await this.svs.stop();
    await this.db.close();
  }

  /**
   * Start the provider.
   * This will subscribe to updates and load persisted data.
   */
  private async start() {
    await this.svs.subscribe({
      on_yjs_delta: async (pubs) => {
        try {
          // Persist the updates to database
          await this.persist(
            pubs.map((pub) => ({
              uuid: pub.uuid,
              update: pub.binary,
            })),
          );

          // Filter and group updates for loaded documents
          const apply = new Map<string, Uint8Array[]>(); // uuid -> [update]
          for (const pub of pubs) {
            if (this.docs.has(pub.uuid)) {
              const applyList = apply.get(pub.uuid) || [];
              applyList.push(pub.binary);
              apply.set(pub.uuid, applyList);
            }
          }

          // Apply updates to loaded documents in transaction
          for (const [uuid, applyList] of apply) {
            const doc = this.docs.get(uuid);
            doc?.transact(() => {
              for (const update of applyList) {
                Y.applyUpdateV2(doc, update, this);
              }
            }, this);
          }
        } catch (e) {
          console.error('Failed to apply update', e);
        }
      },
    });
    await this.svs.start();
  }

  /**
   * Get a Yjs document from the project.
   *
   *  @param uuid UUID of the document
   */
  public async getDoc(uuid: string): Promise<Y.Doc> {
    let doc = this.docs.get(uuid);
    if (doc) return doc;

    doc = new Y.Doc();
    this.docs.set(uuid, doc);

    // Load updates from IndexedDB
    await this.readInto(doc, uuid);

    // Subscribe to updates
    doc.on('updateV2', async (update, origin) => {
      // Ignore updates from self
      if (origin === this) return;

      // Publish the update to SVS
      await this.svs.pub_yjs_delta(uuid, update);

      // Persist the update to IndexedDB
      await this.persist([{ uuid, update }]);
    });

    // Cleanup on document destroy
    doc.once('destroy', () => {
      this.docs.delete(uuid);
      this.aware.delete(uuid);
    });

    return doc;
  }

  /**
   * Load updates from persistence into a document.
   *
   * @param doc Document to load into
   * @param uuid UUID of the document
   */
  public async readInto(doc: Y.Doc, uuid: string): Promise<void> {
    const updates = await this.db.updateGetAll(uuid);
    doc.transact(() => {
      for (const update of updates) {
        Y.applyUpdateV2(doc, update.update, this);
      }
    }, this);
  }

  /**
   * Publish a blob object to the group
   *
   * @param uuid UUID of the document
   * @param blob Blob to publish
   *
   * @returns Name of the published blob
   */
  public async publishBlob(uuid: string, blob: Uint8Array): Promise<string> {
    // Seems okay to use ms time as version for now.
    const version = Date.now();

    // Place all blobs under the data prefix.
    const name = `${this.svs.data_prefix}/32=blob/${uuid}/v=${version}`;
    await this.wksp.produce(name, blob);

    // Publish name to sync group for repo to pick up
    await this.svs.pub_blob_fetch(name);

    return name;
  }

  /**
   * Consume a blob object from the network.
   * Strictly speaking, this has nothing to do with SVS, it's a pure network operation.
   */
  public async consumeBlob(name: string) {
    return await this.wksp.consume(name);
  }

  /**
   * Get the awareness instance for a document.
   * If an awareness exists, the same instance will be returned.
   *
   * @param uuid UUID of the document
   */
  public async getAwareness(uuid: string): Promise<awareProto.Awareness> {
    const doc = this.docs.get(uuid);
    if (!doc) throw new Error('Document not loaded');

    let aware = this.aware.get(uuid);
    if (aware) return aware;

    // Allocate a name under the same namespace as the SVS instance.
    // This way we don't need to register a separate prefix with the network.
    const name = `${this.svs.sync_prefix}/32=aware/${uuid}`;
    aware = await NdnAwareness.create(name, doc, this.wksp);
    this.aware.set(doc.guid, aware);

    return aware;
  }

  /**
   * Check if a FS file is in sync with the document.
   *
   * @param uuid UUID of the document
   * @param mtime Last modified time of the file
   *
   * @returns Last update time if sync is needed, or null if no sync is needed
   */
  public async needsSync(uuid: string, mtime: number): Promise<number | null> {
    // Node can return fractional mtime
    mtime = Math.round(mtime);

    // Get last update time for the document
    const lastUpdate = await this.db.updateLast(uuid);
    if (!lastUpdate) return null;

    // If the file was modified by someone else, we need to sync
    const lastSync = await this.db.fsSyncGet(uuid);
    if (lastSync?.mtime !== mtime) return lastUpdate.utime;

    // Check if the document was modified after the last sync
    if (lastUpdate.utime !== lastSync.utime) return lastUpdate.utime;

    // No sync needed
    return null;
  }

  /**
   * Mark a FS file as in sync with the document.
   *
   * @param uuid UUID of the document
   * @param utime Last update time of the document that was synced
   * @param mtime Last modified time of the file
   */
  public async markSynced(uuid: string, utime: number, mtime: number): Promise<void> {
    // Node can return fractional mtime
    mtime = Math.round(mtime);

    // Mark the document as synced
    await this.db.fsSyncPut({ uuid, utime, mtime });
  }

  /**
   * Persist one or more updates to database.
   * Checks if the document needs compaction.
   */
  private async persist(updates: { uuid: string; update: Uint8Array }[]) {
    const utime = utils.monotonicEpoch();
    const id = await this.db.updatePutAll(updates.map((update) => ({ ...update, utime })));

    // Mark the document as dirty
    for (const { uuid } of updates) {
      this.persistDirty.add(uuid);
    }

    // Compact the database every few updates
    if (this.isCompacting || id - this.lastCompaction < 500) return;
    this.isCompacting = true;
    globalThis.setTimeout(() => this.compact(id), 10); // background
  }

  /**
   * Compact the database.
   * The caller MUST set isCompacting to true before calling this.
   *
   * @todo Move this to a web worker
   */
  private async compact(id: number) {
    try {
      // For the first compaction, check all documents
      if (this.lastCompaction === 0) {
        for (const uuid of await this.db.updateListUUID()) {
          this.persistDirty.add(uuid);
        }
      }

      // Check all dirty documents
      for (const uuid of this.persistDirty) {
        this.persistDirty.delete(uuid);

        // Check if we need to compact this document
        const count = await this.db.updateCount(uuid);
        if (count > 100) {
          let maxId = 0; // last update id we merged
          const temp = new Y.Doc(); // temporary document to merge updates

          const updates = await this.db.updateGetAll(uuid);
          for (const update of updates) {
            Y.applyUpdateV2(temp, update.update, this);
            maxId = Math.max(maxId, update.id!);
          }

          // Encode the merged state
          const merged = Y.encodeStateAsUpdateV2(temp);
          temp.destroy();

          // Merge updates and delete old ones in a transaction
          const utime = utils.monotonicEpoch();
          await this.db.updatePutAll([{ uuid, utime, update: merged }]);
          await this.db.updateDeleteTill(uuid, maxId);
        }
      }

      this.lastCompaction = id;
    } catch (err) {
      console.error('Failed to compact database', err);
    } finally {
      this.isCompacting = false;
    }
  }
}

/**
 * Yjs awareness backed by an NDN sync group.
 */
class NdnAwareness extends awareProto.Awareness {
  private throttle: number = 0;
  private readonly throttleSet: Set<number> = new Set();

  public static async create(name: string, doc: Y.Doc, wksp: WorkspaceAPI): Promise<NdnAwareness> {
    const ndnAwareness = await wksp.awareness(name);
    await ndnAwareness.start();

    // Create the awareness instance
    const me = new NdnAwareness(doc);

    // Unhook on document destroy
    doc.once('destroy', async () => {
      me.destroy();
      globalThis.clearTimeout(me.throttle);
      await me.flush(ndnAwareness); // last update
      await ndnAwareness.stop();
    });

    // Make our own color here based on username
    const username = wksp.name ?? 'Unknown';
    const hash = utils.cyrb64(username);
    const r = (hash[0] % 128) + 110;
    const g = ((hash[0] >> 7) % 128) + 110;
    const b = (hash[1] % 128) + 110;

    // Set the local user state
    const userState: AwarenessLocalState['user'] = {
      name: username, // common
      color: `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`, // milkdown+monaco
    };
    me.setLocalStateField('user', userState);

    // Check for updates
    me.on('update', ({ added, updated, removed }: any, source: 'local' | 'remote') => {
      // Inject styles for remote updates
      if (source !== 'local') {
        for (const client of added) {
          const state = me.getStates().get(client) as AwarenessLocalState | undefined;
          me.injectStyles(client, state?.user);
        }
        return;
      }

      // Throttle updates
      for (const client of added.concat(updated).concat(removed)) {
        me.throttleSet.add(client);
      }
      if (!me.throttle) {
        me.throttle = globalThis.setTimeout(() => me.flush(ndnAwareness), 250);
      }
    });

    // Subscribe to remote updates
    ndnAwareness.subscribe((pub) => {
      try {
        awareProto.applyAwarenessUpdate(me, pub, 'remote');
      } catch (e) {
        console.error(e);
      }
    });

    return me;
  }

  private async flush(ndnAwareness: AwarenessApi) {
    const updates = Array.from(this.throttleSet);
    const updatesBin = awareProto.encodeAwarenessUpdate(this, updates);
    this.throttle = 0;
    this.throttleSet.clear();
    await ndnAwareness.publish(updatesBin);
  }

  private injectStyles(client: number, user: AwarenessLocalState['user'] | undefined) {
    if (!user?.color) return;
    if (!/^#[0-9a-f]{6}$/i.test(user.color)) {
      console.error('Invalid color', user.name, user.color);
      return;
    }

    if (awarenessHaveStyles.has(client)) return;
    awarenessHaveStyles.add(client);

    if (!awarenessStyles) return;

    // Monaco editor colors (see CodeEditor.vue)
    awarenessStyles.textContent += `
      .yRemoteSelection.yRemoteSelection-${client} {
        background-color: ${user.color};
      }
      .yRemoteSelectionHead.yRemoteSelectionHead-${client} {
        border-color: ${user.color};
      }
      .yRemoteSelectionHead.yRemoteSelectionHead-${client}::after {
        content: "${user.name}";
        background-color: ${user.color};
        color: black;
      }
    `;
  }
}

// Awareness styles go to the head
const awarenessHaveStyles = new Set<number>();
let awarenessStyles: HTMLStyleElement;
if (globalThis.document) {
  awarenessStyles = document.createElement('style');
  globalThis.document.head.appendChild(awarenessStyles);
}
