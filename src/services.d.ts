import type { StatsDb } from '@/services/database/stats';
import type { ProjDbConstructor } from '@/services/database/proj_db';

declare global {
  interface OwnlyServices {
    stats: StatsDb;
    ProjDb: ProjDbConstructor;

    getStorageRoot(): Promise<FileSystemDirectoryHandle>;
    streamSaver: typeof import('streamsaver'); // browser only
  }

  // eslint-disable-next-line no-var
  var _o: OwnlyServices;
}
