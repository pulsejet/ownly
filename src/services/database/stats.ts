import type { IWkspStats } from '@/services/types';

export interface StatsDb {
  /** Get list of workspaces */
  list(): Promise<IWkspStats[]>;

  /** Get workspace stats by name */
  get(name: string): Promise<IWkspStats | undefined>;

  /** Write workspace stats */
  put(name: string, stats: IWkspStats): Promise<void>;

  /** Delete workspace stats */
  del(name: string): Promise<void>;
}
