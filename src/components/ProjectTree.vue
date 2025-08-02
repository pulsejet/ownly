<template>
  <ul class="menu-list project-inner">
    <li v-for="entry of tree" :key="entry.name">
      <!-- Rename this entry -->
      <ProjectTreeInput
        class="tree-input"
        v-if="renameEntry?.name === entry.name"
        @cancel="renameEntry = null"
        :name="renameEntry.name"
        @done="executeRename"
      />

      <!-- Render the entry -->
      <component
        v-else
        class="one-entry"
        :is="entry.is_folder ? 'a' : 'router-link'"
        :to="entry.is_folder ? null : linkToFile(entry)"
        :title="entry.name"
        @click="openFolder(entry)"
      >
        <div class="link-inner">
          <FontAwesomeIcon class="mr-1" :icon="chooseIcon(entry)" size="sm" />
          {{ entry.name }}
        </div>

        <ProjectTreeMenu
          class="link-button"
          :allow-new="entry.is_folder"
          :allow-delete="true"
          :allow-rename="true"
          @new-file="onSubtree(entry, (t) => t.newHere('file', $event))"
          @new-folder="onSubtree(entry, (t) => t.newHere('folder', $event))"
          @import="onSubtree(entry, (t) => t.importHere())"
          @import-zip="onSubtree(entry, (t) => t.importZipHere())"
          @export="executeExport(entry)"
          @rename="renameEntry = entry"
          @delete="executeDelete(entry)"
        />
      </component>

      <ProjectTree
        ref="subtrees"
        v-if="isFolderOpen(entry)"
        :project="props.project"
        :files="[]"
        :rtree="entry.children ?? []"
        :path="`${path}${entry.name}/`"
        :parent="entry.name"
      />
    </li>

    <ProjectTreeInput
      class="tree-input"
      v-if="newFile.show"
      @cancel="newFile.show = false"
      @done="executeNew"
    />
  </ul>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useTemplateRef, watch, type PropType } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import * as zip from '@zip.js/zip.js';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faFolder,
  faFolderOpen,
  faFile,
  faFileCode,
  faFileWord,
  faFilePowerpoint,
  faFileExcel,
  faFilePdf,
  faFileImage,
} from '@fortawesome/free-solid-svg-icons';

import ProjectTreeInput from './ProjectTreeInput.vue';
import ProjectTreeMenu from './ProjectTreeMenu.vue';

import { Workspace } from '@/services/workspace';
import * as utils from '@/utils';
import { Toast } from '@/utils/toast';

import type { IProject, IProjectFile } from '@/services/types';

type TreeEntry = {
  name: string;
  children?: TreeEntry[];
  is_folder?: boolean;
};

const props = defineProps({
  project: {
    type: Object as PropType<IProject>,
    required: true,
  },
  files: {
    type: Array as PropType<IProjectFile[]>,
    required: true,
  },
  rtree: {
    type: Array as PropType<TreeEntry[]>,
    required: false,
  },
  path: {
    type: String,
    required: false,
    default: '/',
  },
  parent: {
    type: String,
    required: false,
    default: '',
  },
});

const route = useRoute();
const router = useRouter();

// vue-tsc is currently broken for the type inference
const subtrees = useTemplateRef<Array<any>>('subtrees');

const newFile = ref({
  show: false,
  type: 'file' as 'file' | 'folder',
  ext: null as string | null,
});
const renameEntry = ref(null as TreeEntry | null);

defineExpose({ newHere, importHere, importZipHere, executeExport, parent: props.parent });
onMounted(checkRoute);
watch(() => route.params.filename, checkRoute);
const splitPath = computed(() => props.path.split('/').filter(Boolean));

/**
 * Tree computes the tree structure from the flat files list.
 * If this component is recursive, then rtree should be passed and is used instead.
 */
const tree = computed<TreeEntry[]>(() => {
  if (props.rtree) return props.rtree;

  // Computed tree structure
  const tree: TreeEntry[] = [];

  // DFS to fill the tree for the given path
  const fillPrefix = (path: string) => {
    const parts = path.split('/');
    let current = tree;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part) continue;

      const existing = current.find((e) => e.name === part);
      if (existing) {
        current = existing.children!;
      } else {
        const newEntry: TreeEntry = {
          name: part,
          is_folder: i !== parts.length - 1,
          children: [],
        };
        current.push(newEntry);
        current = newEntry.children!;
      }
    }
  };

  // Fill the tree for all files
  for (const file of props.files) {
    fillPrefix(file.path);
  }

  // Sort the tree by folder -> name
  const sortTree = (tree: TreeEntry[]) => {
    tree.sort((a, b) => {
      if (a.is_folder && !b.is_folder) return -1;
      if (!a.is_folder && b.is_folder) return 1;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true });
    });
    for (const entry of tree) {
      if (entry.children) sortTree(entry.children);
    }
  };
  sortTree(tree);

  return tree;
});

// Watch if the route changes to a file that includes this node's child
// In that case make sure that the child folder is open
function checkRoute() {
  if (!route.params.filename) return;
  const parts = route.params.filename as string[];
  if (parts.length <= 1) return;

  // Check if the route is a child of this folder
  const myparts = splitPath.value;
  if (parts.length <= myparts.length) return;
  if (parts.slice(0, myparts.length).every((p, i) => p === myparts[i])) {
    // Check if the route is a direct child of this folder
    const folder = parts[myparts.length];
    const entry = tree.value.find((e) => e.name === folder);
    if (entry) openFolder(entry, true);
  }
}

/** Get router link to a file */
function linkToFile(entry: TreeEntry) {
  return {
    name: 'project-file',
    params: {
      project: props.project.name,
      filename: splitPath.value.concat(entry.name),
    },
  };
}

/** Choose an icon for a given entry */
function chooseIcon(entry: TreeEntry) {
  if (entry.is_folder) {
    return foldersOpen.value[entry.name] ? faFolderOpen : faFolder;
  }

  switch (utils.getExtensionType(entry.name)) {
    case 'code':
    case 'latex':
      return faFileCode;
    case 'word':
    case 'milkdown':
      return faFileWord;
    case 'ppt':
      return faFilePowerpoint;
    case 'excel':
      return faFileExcel;
    case 'pdf':
      return faFilePdf;
    case 'image':
      return faFileImage;
    case 'excalidraw':
      return faFileImage;
    default:
      return faFile;
  }
}

/** Map of open folders for O(1) lookup */
const foldersOpen = ref<Record<string, boolean>>({});

/** Check if folder is open (show contents inside) */
function isFolderOpen(entry: TreeEntry) {
  return entry.is_folder && foldersOpen.value[entry.name];
}

/** Mark folder as open */
function openFolder(entry: TreeEntry, val?: boolean) {
  if (entry.is_folder) {
    foldersOpen.value[entry.name] = val !== undefined ? val : !foldersOpen.value[entry.name];
  }
}

/** Run the callback on a subtree component */
function onSubtree(subfolder: TreeEntry, callback: (subtree: any) => void) {
  if (!subfolder.is_folder) return;
  openFolder(subfolder, true);
  nextTick(() => {
    const subtree = subtrees.value?.find((t) => t?.parent === subfolder.name);
    if (subtree) callback(subtree);
  });
}

/** Get the project path to a entry */
function getEntryPath(entry: TreeEntry) {
  return `${props.path}${entry.name}${entry.is_folder ? '/' : ''}`;
}

/** Create a new file in the current folder */
async function newHere(type: 'file' | 'folder', ext?: string) {
  newFile.value = {
    show: true,
    type: type,
    ext: ext || String(),
  };
}

/** Create a new file or folder */
async function executeNew(name: string) {
  if (name.length < 1 || name.length > 40) {
    Toast.error('File and folder name must be between 1 and 40 characters');
    return;
  }

  if (name.includes('/')) {
    Toast.error('File and folder name cannot contain slashes');
    return;
  }

  let path = `${props.path}${name}`;
  if (newFile.value.type === 'folder') {
    path += '/';
  }

  const ext = newFile.value.ext;
  if (ext && !path.endsWith(ext)) {
    path += `.${ext}`;
  }

  try {
    const proj = await Workspace.setupAndGetActiveProj(router);
    await proj.newFile(path);
  } catch (err) {
    console.error(err);
    Toast.error(`Error creating ${name}: ${err}`);
    return;
  }

  newFile.value.show = false;
}

/** Delete a file or folder */
async function executeDelete(entry: TreeEntry) {
  const path = getEntryPath(entry);

  // TODO: confirmation prompt

  try {
    const proj = await Workspace.setupAndGetActiveProj(router);
    await proj.deleteFile(path);
  } catch (err) {
    console.error(err);
    Toast.error(`Error deleting ${path}: ${err}`);
  }
}

/** Import files from user */
async function importHere() {
  const proj = await Workspace.setupAndGetActiveProj(router);

  const files = await utils.selectFiles({ multiple: true });
  if (!files.length) return;

  // Import all selected files
  for (const file of files) {
    try {
      const path = `${props.path}${file.name}`;
      await Toast.promise(proj.importFile(path, file.stream()), {
        pending: `Importing ${file.name}`,
        success: `Imported ${file.name}`,
        error: `Could not import ${file.name}`,
      });
    } catch (err) {
      console.warn(err);
    }
  }
}

/** Import a ZIP file from user */
async function importZipHere() {
  const proj = await Workspace.setupAndGetActiveProj(router);

  const files = await utils.selectFiles({
    accept: '.zip',
    multiple: false,
  });
  const zipFile = files[0] ?? null;
  if (!zipFile) return;

  // Read the ZIP file and import each entry
  const reader = new zip.ZipReader(new zip.BlobReader(zipFile));

  // Show progress of import
  const progress = Toast.loading(`Importing files from ${zipFile.name}`);

  let importedCount = 0;
  for await (const entry of reader.getEntriesGenerator()) {
    try {
      // We don't need to make folders
      if (entry.directory) continue;

      // Show progress of import
      await progress.msg(`Importing ${entry.filename} from ${zipFile.name}`);

      // Read the entry to buffer
      const writer = new zip.BlobWriter();
      await entry.getData?.(writer);
      const content = await writer.getData();

      // Import the file
      const path = `${props.path}${entry.filename}`;
      await proj.importFile(path, content.stream());
      importedCount++;
    } catch (err) {
      console.warn(err);
      Toast.warning(`Could not import ${entry.filename}: ${err}`);
    }
  }

  if (importedCount > 0) {
    progress.success(`Imported ${importedCount} files from ${zipFile.name}`);
  } else {
    progress.warning(`No files imported from ${zipFile.name}`);
  }
}

/** Export a file or folder */
async function executeExport(entry: TreeEntry | null) {
  // If entry is null, use root path
  const path = entry ? getEntryPath(entry) : props.path;
  try {
    const proj = await Workspace.setupAndGetActiveProj(router);
    await proj.download(path);
  } catch (err) {
    console.error(err);
    Toast.error(`Error exporting ${path}: ${err}`);
  }
}

/** Rename a file or folder */
async function executeRename(name: string) {
  if (!renameEntry.value) return;

  try {
    const proj = await Workspace.setupAndGetActiveProj(router);

    const oldPath = getEntryPath(renameEntry.value);
    const newPath = getEntryPath({ ...renameEntry.value, name });
    await proj.moveFile(oldPath, newPath);

    renameEntry.value = null;
  } catch (err) {
    console.error(err);
    Toast.error(`Error renaming ${renameEntry.value!.name}: ${err}`);
  }
}
</script>

<style lang="scss" scoped>
@use '@/components/navbar-item.scss';

.project-inner {
  padding-inline-start: 4px !important;
  &:not(.outermost) {
    margin: 0 0 0 6px !important;
  }
  &.outermost {
    margin: 4px 4px !important;
  }

  li > a,
  .tree-input :deep(input) {
    height: 1.9em;
    font-size: 0.88em;
    padding: 0.4em 0.5em;
    line-height: 1.05em;
  }

  .one-entry > .link-button {
    display: none;
    // This is truly horrible, but it's the only way to reuse
    // the styles between navbar and project tree for the link
    // button with a bunch of !importants everywhere :'(
    transform: translateY(-0.2em);
  }
  .one-entry:hover > .link-button {
    display: inline-block;
  }
}
</style>
