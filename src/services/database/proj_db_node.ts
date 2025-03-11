import fs from 'fs/promises';
import { DatabaseSync } from 'node:sqlite';

import type { FsSyncEntry, ProjDb, UpdateEntry } from './proj_db';

export class NodeProjDb implements ProjDb {
  private db: DatabaseSync;

  constructor(name: string) {
    this.db = new DatabaseSync(`${name}.db`);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS updates (
        id INTEGER PRIMARY KEY,
        uuid TEXT,
        utime INTEGER,
        update_bin BLOB
      ) STRICT;
      CREATE INDEX IF NOT EXISTS idx_updates_uuid ON updates (uuid);

      CREATE TABLE IF NOT EXISTS fs_sync (
        uuid TEXT PRIMARY KEY,
        utime INTEGER,
        mtime INTEGER
      ) STRICT;

      CREATE TABLE IF NOT EXISTS state (
        type TEXT PRIMARY KEY,
        state BLOB
      ) STRICT
    `);
  }

  static async deleteWksp(name: string): Promise<void> {
    // Project name is "root" or nanoid
    const re = new RegExp(`^${name}-(root|.{21})\\.db$`);
    for (const file of await fs.readdir('.')) {
      if (re.test(file)) await fs.unlink(file);
    }
  }

  async close(): Promise<void> {
    this.db.close();
  }

  async stateGet(type: string): Promise<Uint8Array | undefined> {
    const sql = this.db.prepare(`SELECT * FROM state WHERE type = ?`);
    const res: any = sql.get(type);
    return res ? res.state : undefined;
  }

  async statePut(type: string, state: Uint8Array): Promise<string> {
    const sql = this.db.prepare(`
      INSERT INTO state (type, state) VALUES (?, ?)
      ON CONFLICT(type) DO UPDATE SET state = excluded.state
    `);
    sql.run(type, state);
    return type;
  }

  async updatePutAll(updates: UpdateEntry[]): Promise<number> {
    let lastId: number = -1;

    const stmt = this.db.prepare(`INSERT INTO updates (uuid, utime, update_bin) VALUES (?, ?, ?)`);
    for (const update of updates) {
      const res = stmt.run(update.uuid, update.utime, update.update);
      lastId = Number(res.lastInsertRowid);
    }

    return lastId;
  }

  async updateGetAll(uuid: string): Promise<UpdateEntry[]> {
    const sql = this.db.prepare(`SELECT * FROM updates WHERE uuid = ? ORDER BY id`);
    const res: any[] = sql.all(uuid);
    return res.map((row) => ({
      id: row.id,
      uuid: row.uuid,
      utime: row.utime,
      update: row.update_bin,
    }));
  }

  async updateCount(uuid: string): Promise<number> {
    const sql = this.db.prepare(`SELECT COUNT(*) as count FROM updates WHERE uuid = ?`);
    const res: any = sql.get(uuid);
    return res.count;
  }

  async updateLast(uuid: string): Promise<UpdateEntry | undefined> {
    const sql = this.db.prepare(`SELECT * FROM updates WHERE uuid = ? ORDER BY id DESC LIMIT 1`);
    const res: any = sql.get(uuid);
    return res
      ? {
          id: res.id,
          uuid: res.uuid,
          utime: Number(res.utime),
          update: res.update_bin,
        }
      : undefined;
  }

  async updateListUUID(): Promise<string[]> {
    const sql = this.db.prepare(`SELECT DISTINCT uuid FROM updates`);
    const res: any[] = sql.all();
    return res.map((row) => row.uuid);
  }

  async updateDeleteTill(uuid: string, maxId: number): Promise<void> {
    const sql = this.db.prepare(`DELETE FROM updates WHERE uuid = ? AND id <= ?`);
    sql.run(uuid, maxId);
  }

  async fsSyncGet(uuid: string): Promise<FsSyncEntry | undefined> {
    const sql = this.db.prepare(`SELECT * FROM fs_sync WHERE uuid = ?`);
    const res: any = sql.get(uuid);
    return res
      ? {
          uuid: res.uuid,
          utime: Number(res.utime),
          mtime: Number(res.mtime),
        }
      : undefined;
  }

  async fsSyncPut(entry: FsSyncEntry): Promise<void> {
    const sql = this.db.prepare(`
      INSERT INTO fs_sync (uuid, utime, mtime) VALUES (?, ?, ?)
      ON CONFLICT(uuid) DO UPDATE SET utime = excluded.utime, mtime = excluded.mtime
    `);
    sql.run(entry.uuid, entry.utime, entry.mtime);
  }
}
