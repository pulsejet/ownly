<template>
  <div ref="outer" class="outer"></div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef, watch, type PropType } from 'vue';

import * as Y from 'yjs';
import type { Awareness } from 'y-protocols/awareness.js';

import { Crepe } from '@milkdown/crepe';
import { collab, CollabService, collabServiceCtx } from '@milkdown/plugin-collab';
import '@milkdown/crepe/theme/common/style.css';

import * as utils from '@/utils';

const props = defineProps({
  yxml: {
    type: Object as PropType<Y.XmlFragment>,
    required: true,
  },
  awareness: {
    type: Object as PropType<Awareness>,
    required: true,
  },
});

const outer = useTemplateRef('outer');

let crepe: Crepe | null = null;
let collabService: CollabService | null = null;

watch(
  () => props.yxml,
  async () => {
    await destroy();
    await create();
  },
);
onMounted(create);
onBeforeUnmount(destroy);

async function create() {
  if (utils.themeIsDark()) {
    await import('@milkdown/crepe/theme/frame-dark.css');
  } else {
    await import('@milkdown/crepe/theme/frame.css');
  }

  crepe = new Crepe({
    root: outer.value!,
  });
  crepe.editor.use(collab);
  await crepe.create();

  crepe.editor.action((ctx) => {
    collabService = ctx.get(collabServiceCtx);
    collabService.bindXmlFragment(props.yxml).setAwareness(props.awareness).connect();
  });
}

async function destroy() {
  collabService?.disconnect();
  await crepe?.destroy();
}
</script>

<style scoped lang="scss">
.outer :deep(.milkdown) {
  height: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
}
</style>

<style lang="scss">
// Fix overlap with side panel of milkdown itself (strange)
// If you select text the + button will overlap with the toolbar
milkdown-toolbar,
milkdown-latex-inline-edit {
  z-index: 20;
}

@media (max-width: 1023px) {
  .milkdown .ProseMirror {
    touch-action: manipulation;
    padding-left: 20px !important;
    padding-right: 20px !important;
  }
}

.ProseMirror-yjs-cursor {
  position: relative;
  border-left: 2px solid black;
  margin-left: -1px !important;
  margin-right: -1px !important;
  border-color: orange;
  word-break: normal;
  pointer-events: none;
}

.ProseMirror-yjs-cursor > div {
  position: absolute;
  top: calc(-1rem - 1px);
  left: -3px;
  font-size: 10pt;
  background-color: orange;
  border-radius: 3px;
  padding: 1px 4px;
  font-style: normal;
  font-weight: normal;
  line-height: normal;
  user-select: none;
  color: black;
  white-space: nowrap;
  animation: fade90 4s forwards;
}
</style>
