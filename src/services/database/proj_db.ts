export interface ProjDb {
  /** Close the database */
  close(): Promise<void>;

  /** Get arbitrary state */
  stateGet(type: string): Promise<Uint8Array | undefined>;
  /** Store arbitrary state */
  statePut(type: string, state: Uint8Array): Promise<string>;

  /**
   * Put updates in a single transaction.
   * @returns Latest ID of the update.
   */
  updatePutAll(updates: UpdateEntry[]): Promise<number>;
  /**
   * Get all updates for a document.
   * @returns List of updates sorted by ID.
   */
  updateGetAll(uuid: string): Promise<UpdateEntry[]>;
  /** Get count of updates for a document */
  updateCount(uuid: string): Promise<number>;
  /** Get the last update for a document */
  updateLast(uuid: string): Promise<UpdateEntry | undefined>;
  /** Get a list of all UUID documents */
  updateListUUID(): Promise<string[]>;
  /** Delete all updates upto an ID */
  updateDeleteTill(uuid: string, maxId: number): Promise<void>;

  /** Get fs sync record */
  fsSyncGet(uuid: string): Promise<FsSyncEntry | undefined>;
  /** Put fs sync record */
  fsSyncPut(fsSync: FsSyncEntry): Promise<void>;
}

export interface ProjDbConstructor {
  /**
   * Create a new database with slug (full).
   */
  new (name: string): ProjDb;

  /**
   * Delete the database with slug prefix.
   * All databases with the same prefix will be deleted.
   */
  deleteWksp(name: string): Promise<void>;
}

/**
 * Schema for update entry.
 * Each row is a single Yjs update.
 */
export type UpdateEntry = {
  id?: number;
  uuid: string;
  utime: number;
  update: Uint8Array;
};

/**
 * Schema for FS sync entry.
 * Each row is a single file system update.
 */
export type FsSyncEntry = {
  uuid: string;
  utime: number;
  mtime: number;
};

/**
 * Schema to store arbitrary state.
 */
export type StateEntry = {
  type: string;
  state: Uint8Array;
};
