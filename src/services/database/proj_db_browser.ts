import Dexie from 'dexie';

import type { FsSyncEntry, ProjDb, StateEntry, UpdateEntry } from './proj_db';

export class IDBProjDb implements ProjDb {
  private db: Dexie & {
    updates: Dexie.Table<UpdateEntry, number>;
    fs_sync: Dexie.Table<FsSyncEntry, string>;
    state: Dexie.Table<StateEntry, string>;
  };

  constructor(name: string) {
    this.db = new Dexie(name) as any;
    this.db.version(1).stores({
      updates: '++id, uuid',
      fs_sync: 'uuid',
      state: 'type',
    });
  }

  static async deleteWksp(name: string): Promise<void> {
    // Project name is "root" or nanoid
    const re = new RegExp(`^${name}-(root|.{21})$`);
    for (const db of await Dexie.getDatabaseNames()) {
      if (re.test(db)) await Dexie.delete(db);
    }
  }

  async close(): Promise<void> {
    this.db.close();
  }

  async stateGet(type: string): Promise<Uint8Array | undefined> {
    return (await this.db.state.get(type))?.state;
  }

  async statePut(type: string, state: Uint8Array): Promise<string> {
    return await this.db.state.put({ type, state });
  }

  async updatePutAll(updates: UpdateEntry[]): Promise<number> {
    let lastId: number = -1;
    await this.db.transaction('rw', this.db.updates, async () => {
      for (const update of updates) {
        lastId = await this.db.updates.put(update);
      }
    });
    return lastId;
  }

  async updateGetAll(uuid: string): Promise<UpdateEntry[]> {
    return await this.db.updates.where('uuid').equals(uuid).sortBy('id');
  }

  async updateCount(uuid: string): Promise<number> {
    return await this.db.updates.where('uuid').equals(uuid).count();
  }

  async updateLast(uuid: string): Promise<UpdateEntry | undefined> {
    return await this.db.updates.where('uuid').equals(uuid).last();
  }

  async updateListUUID(): Promise<string[]> {
    return (await this.db.updates.orderBy('uuid').uniqueKeys()).map(String);
  }

  async updateDeleteTill(uuid: string, maxId: number): Promise<void> {
    await this.db.updates
      .where('uuid')
      .equals(uuid)
      .and((update) => update.id! <= maxId)
      .delete();
  }

  async fsSyncGet(uuid: string): Promise<FsSyncEntry | undefined> {
    return await this.db.fs_sync.get(uuid);
  }

  async fsSyncPut(entry: FsSyncEntry): Promise<void> {
    await this.db.fs_sync.put(entry);
  }
}
