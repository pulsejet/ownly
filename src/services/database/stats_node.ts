import { DatabaseSync } from 'node:sqlite';

import type { IWkspStats } from '../types';
import type { StatsDb } from './stats';

export class NodeStatsDb implements StatsDb {
  private db = new DatabaseSync('ownly.db');

  constructor() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS workspaces (
        name TEXT PRIMARY KEY,
        stats TEXT
      ) STRICT;
    `);
  }

  public async list(): Promise<IWkspStats[]> {
    const sql = this.db.prepare(`SELECT * FROM workspaces`);
    const res: any[] = sql.all();
    return res.map((row) => JSON.parse(row.stats));
  }

  public async get(name: string): Promise<IWkspStats | undefined> {
    const sql = this.db.prepare(`SELECT * FROM workspaces WHERE name = ?`);
    const res: any = sql.get(name);
    return res ? JSON.parse(res.stats) : undefined;
  }

  public async put(name: string, stats: IWkspStats): Promise<void> {
    const sql = this.db.prepare(`
      INSERT INTO workspaces (name, stats) VALUES (?, ?)
      ON CONFLICT(name) DO UPDATE SET stats = excluded.stats
    `);
    sql.run(name, JSON.stringify(stats));
  }

  public async del(name: string): Promise<void> {
    const sql = this.db.prepare(`DELETE FROM workspaces WHERE name = ?`);
    sql.run(name);
  }
}
