import { exportWorker } from 'webworker-typed';
import { getFileHandle } from './opfs-common';

// WebWorker is only used on Safari, so we are guaranteed to be in the browser
self._o = {} as any;
self._o.getStorageRoot = () => self.navigator.storage.getDirectory();

/**
 * Write to a file and close it.
 * This is done in a separate web worker only for Safari.
 *
 * @param path Full path of file
 * @param content Content to write
 */
export async function writeContents(path: string, content: ArrayBuffer): Promise<number> {
  const handle = await getFileHandle(path);
  const syncHandle = await handle.createSyncAccessHandle();
  syncHandle.truncate(0);
  syncHandle.write(content);
  syncHandle.flush();
  syncHandle.close();
  return content.byteLength;
}

export default exportWorker({
  writeContents,
});
