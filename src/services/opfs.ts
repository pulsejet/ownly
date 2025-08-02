import * as zip from '@zip.js/zip.js';
export { getFileHandle, getDirectoryHandle } from './opfs-common.ts';

import { importWorker, transfer } from 'webworker-typed';
import type MyWorker from './opfs-worker.ts';

const worker = importWorker<typeof MyWorker>(
  new Worker(new URL('./opfs-worker.ts', import.meta.url), { type: 'module' }),
);

/**
 * Write to a file and close it
 * @param handle File handle
 * @param path Full path of file (for Safari)
 * @param content Content to write
 */
export async function writeContents(
  handle: FileSystemFileHandle,
  path: string,
  content: Uint8Array,
): Promise<number> {
  // This is not available on Safari, in that case fall back to a WebWorker
  // with a sync write handle. We do this here so no need to handle anything else
  // in the worker (i.e. node)
  if ('createWritable' in handle) {
    const writable = await handle.createWritable();
    await writable.truncate(0);
    await writable.write(content);
    await writable.close();
    return content.length;
  }

  // FileSystemFileHandle should be clonable but that is not the case on Safari
  // Our only option is to ask downstream to provide a path to the file :(
  return await worker.writeContents(path, transfer(content.buffer));
}

/**
 * Walk through the OPFS and call a callback for each file
 * @param folder Root directory handle
 * @param path Path to the directory
 */
export async function* walk(
  folder: FileSystemDirectoryHandle,
  path: string,
): AsyncGenerator<[string, FileSystemFileHandle, FileSystemDirectoryHandle]> {
  for await (const [name, entry] of folder.entries()) {
    if (entry.kind === 'file') {
      yield [`${path}${name}`, entry as FileSystemFileHandle, folder];
    } else if (entry.kind === 'directory') {
      yield* walk(entry as FileSystemDirectoryHandle, `${path}${name}/`);
    }
  }
}

/**
 * Download a file or folder from OPFS
 *
 * @param handle File or folder handle
 */
export async function download(
  handle: FileSystemFileHandle | FileSystemDirectoryHandle,
  opts?: {
    name?: string;
  },
): Promise<void> {
  if (handle.kind === 'file') {
    // Stream file directly to the user
    const fileStream = _o.streamSaver.createWriteStream(opts?.name ?? handle.name);
    const readable = await handle.getFile();
    await readable.stream().pipeTo(fileStream);
  } else if (handle.kind === 'directory') {
    // Stream folder as a ZIP file
    const fileStream = _o.streamSaver.createWriteStream(opts?.name ?? handle.name + '.zip');
    const writer = new zip.ZipWriter(fileStream);
    for await (const [path, entry] of walk(handle, String())) {
      const readable = await entry.getFile();
      await writer.add(path, readable.stream());
    }
    await writer.close();
  } else {
    throw new Error('Invalid handle type');
  }
}
