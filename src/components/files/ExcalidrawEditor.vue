<template>
  <div ref="excalidraw" class="excalidraw-wrapper">Loading...</div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, type PropType, ref, watch, useTemplateRef } from 'vue';

import * as Y from 'yjs';
import { createRoot, type Root } from 'react-dom/client';
import React from 'react';
import '@excalidraw/excalidraw/index.css';
import { CaptureUpdateAction, Excalidraw } from '@excalidraw/excalidraw';
import type {
  ExcalidrawElement,
  OrderedExcalidrawElement,
} from '@excalidraw/excalidraw/element/types';
import type { ImportedDataState } from '@excalidraw/excalidraw/data/types';
import type {
  AppState,
  ExcalidrawImperativeAPI,
  BinaryFiles,
  BinaryFileData,
} from '@excalidraw/excalidraw/types';
import {
  excalidrawToFile,
  type ExcalidrawElementYMap,
  type ExcalidrawFilesYMap,
} from '@/services/excalidraw-types';
import { debounce } from 'lodash-es';

// Define global constants
(window as any).EXCALIDRAW_EXPORT_SOURCE = globalThis.origin;
(window as any).EXCALIDRAW_ASSET_PATH = '/';

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  yeles: {
    type: Object as PropType<ExcalidrawElementYMap>,
    required: true,
  },
  yfiles: {
    type: Object as PropType<ExcalidrawFilesYMap>,
    required: true,
  },
});

const scene = ref<ImportedDataState>();
const excalidrawAPI = ref<ExcalidrawImperativeAPI>();

const compareAndUpdateSingleYMap = <T,>(newMap: Map<string, T>, yMap: Y.Map<T>) => {
  // New & Updated Items
  for (const [id, val] of newMap) {
    // TODO: Use version / versionNonce to compare
    const eleJson = JSON.stringify(val);
    if (!yMap.has(id)) {
      // New item, needs deep copy
      yMap.set(id, JSON.parse(eleJson));
      continue;
    }
    const oldEle = yMap.get(id);
    if (JSON.stringify(oldEle) !== eleJson) {
      // Modified item, needs deep copy
      // Since we do not have finer granularity for now, update the whole element.
      yMap.set(id, JSON.parse(eleJson));
    }
  }
  // Delete items
  for (const id of yMap.keys()) {
    if (!newMap.has(id)) {
      yMap.delete(id);
    }
  }
};

const compareAndUpdateYDoc = (
  newScene: ImportedDataState,
  yeles: ExcalidrawElementYMap,
  yfiles: ExcalidrawFilesYMap,
) => {
  const newElesMap = new Map((newScene.elements ?? []).map((ele) => [ele.id, ele]));
  const newFilesMap = new Map(Object.entries(newScene.files ?? []));
  Y.transact(
    yeles.doc!,
    () => {
      // Elements
      compareAndUpdateSingleYMap(newElesMap, yeles);
      // Files
      compareAndUpdateSingleYMap(newFilesMap, yfiles);
    },
    'excalidraw',
    true,
  );
};

const onEditorChange = (
  elements: readonly OrderedExcalidrawElement[],
  appState: AppState,
  files: BinaryFiles,
) => {
  const newDocFile = excalidrawToFile(elements, appState, files);
  compareAndUpdateYDoc(newDocFile, props.yeles, props.yfiles);
  scene.value = newDocFile;
};

const observerElements = (event: Y.YMapEvent<ExcalidrawElement>) => {
  if (event.transaction.origin === 'excalidraw' || event.transaction.local) {
    // Ignore local changes; do not reload
    return;
  }
  excalidrawAPI.value?.updateScene({
    elements: Array.from(props.yeles.values()),
    // NEVER means the local user cannot undo the remote change
    // By default, it is EVENTUALLY, which means this action will roll back with the last user change.
    captureUpdate: CaptureUpdateAction.NEVER,
  });
};

const observerFiles = (event: Y.YMapEvent<BinaryFileData>) => {
  if (event.transaction.origin === 'excalidraw' || event.transaction.local) {
    // Ignore local changes; do not reload
    return;
  }
  excalidrawAPI.value?.addFiles(Array.from(props.yfiles.values()));
};

let root: Root | undefined;
const excalidraw = useTemplateRef('excalidraw');
const create = () => {
  scene.value = excalidrawToFile(
    Array.from(props.yeles.values()),
    undefined,
    props.yfiles.toJSON(),
  );
  props.yeles.observe(observerElements);
  props.yfiles.observe(observerFiles);

  root = createRoot(excalidraw.value!);
  root.render(
    React.createElement(Excalidraw, {
      UIOptions: {
        canvasActions: {
          loadScene: false,
          saveToActiveFile: false,
        },
      },
      langCode: 'en',
      name: props.name,
      theme: 'light',
      viewModeEnabled: false,
      initialData: {
        ...scene.value,
        scrollToContent: true,
      },
      excalidrawAPI: (api) => (excalidrawAPI.value = api),
      onLinkOpen: (element, event) => {
        // TODO
        event.preventDefault();
      },
      onLibraryChange: () => {
        // TODO
      },
      onChange: debounce(
        (elements: readonly OrderedExcalidrawElement[], appState: AppState, files: BinaryFiles) => {
          // TODO(zjkmxy): Also listen to appstate and files.
          onEditorChange(elements, appState, files);
        },
        250,
      ),
    }),
  );
};

const destroy = () => {
  if (root) {
    root.unmount();
  }
  props.yeles.unobserve(observerElements);
  props.yfiles.unobserve(observerFiles);
};

watch(
  () => props.yeles,
  () => {
    destroy();
    create();
  },
);
onMounted(create);
onBeforeUnmount(destroy);
</script>

<style scoped lang="scss">
.excalidraw-wrapper {
  width: 100%;
  height: 100%;
}
</style>
