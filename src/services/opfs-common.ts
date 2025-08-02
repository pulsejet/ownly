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
