<template>
  <button
    ref="button"
    class="button"
    @click.stop.prevent="dropdown?.open($event)"
    title="Update contents of this node"
  >
    <FontAwesomeIcon class="mr-1" :icon="faCaretDown" size="2xs" />

    <DropdownMenu ref="dropdown">
      <a class="dropdown-item" v-if="allowNew" @click="emit('new-folder')"> New folder </a>
      <a class="dropdown-item" v-if="allowNew" @click="emit('new-file', '')"> New blank file </a>
      <a class="dropdown-item" v-if="allowNew" @click="emit('import')"> Import files </a>
      <a class="dropdown-item" v-if="allowNew" @click="emit('import-zip')"> Import ZIP folder </a>

      <hr class="dropdown-divider" v-if="allowNew" />
      <a class="dropdown-item" v-if="allowNew" @click="emit('new-file', 'mdoc')"> New RichDoc </a>
      <a class="dropdown-item" v-if="allowNew" @click="emit('new-file', 'md')">
        New Markdown file
      </a>
      <a class="dropdown-item" v-if="allowNew" @click="emit('new-file', 'tex')"> New LaTeX file </a>
      <hr class="dropdown-divider" v-if="allowNew" />

      <a class="dropdown-item" @click="emit('export')"> Export </a>
      <a class="dropdown-item" v-if="allowRename" @click="emit('rename')"> Rename </a>
      <a class="dropdown-item" v-if="allowDelete" @click="emit('delete')"> Delete </a>
    </DropdownMenu>
  </button>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import DropdownMenu from './DropdownMenu.vue';

defineProps({
  allowNew: Boolean,
  allowDelete: Boolean,
  allowRename: Boolean,
});

const emit = defineEmits<{
  (e: 'new-folder'): void;
  (e: 'new-file', ext: string): void;
  (e: 'import'): void;
  (e: 'import-zip'): void;
  (e: 'export'): void;
  (e: 'rename'): void;
  (e: 'delete'): void;
}>();

const button = useTemplateRef('button');
const dropdown = useTemplateRef('dropdown');

// This is a bit ugly, but simplifies the parent component
// Attach to the parent's context menu event here and trigger the dropdown
onMounted(() => {
  button.value?.parentElement?.addEventListener('contextmenu', dropdown.value!.open);
});

onBeforeUnmount(() => {
  button.value?.parentElement?.removeEventListener('contextmenu', dropdown.value!.open);
});
</script>

<style lang="css" scoped></style>
