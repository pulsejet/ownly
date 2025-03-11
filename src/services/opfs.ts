import * as zip from '@zip.js/zip.js';

/**
 * Get handle to a file in OPFS recursively
 * @param path Full path of the file
 * @param content File content
 */
export async function getFileHandle(
  path: string,
  opts?: {
    create?: boolean;
    root?: FileSystemDirectoryHandle;
  },
): Promise<FileSystemFileHandle> {
  const parts = path.split('/').filter(Boolean);
  const folder = parts.slice(0, -1).join('/');
  const folderHandle = await getDirectoryHandle(folder, {
    create: opts?.create,
    root: opts?.root,
  });

  const basename = parts[parts.length - 1];
  if (!basename) throw new Error('Invalid file path without basename');

  return await folderHandle.getFileHandle(basename, { create: opts?.create });
}

/**
 * Write to a file and close it
 * @param handle File handle
 * @param content Content to write
 */
export async function write(handle: FileSystemFileHandle, content: Uint8Array): Promise<void> {
  const writable = await handle.createWritable();
  await writable.truncate(0);
  await writable.write(content);
  await writable.close();
}

/**
 * Get directory handle from OPFS recursively
 * @param path Path to the directory
 * @returns Directory handle
 */
export async function getDirectoryHandle(
  path: string,
  opts?: {
    create?: boolean;
    root?: FileSystemDirectoryHandle;
  },
): Promise<FileSystemDirectoryHandle> {
  let folder = opts?.root ?? (await globalThis._o.getStorageRoot());
  const parts = path.split('/').filter(Boolean);
  for (const part of parts) {
    folder = await folder.getDirectoryHandle(part, {
      create: opts?.create ?? false,
    });
  }
  return folder;
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
