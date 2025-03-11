<template>
  <div class="field tree-input">
    <div class="control">
      <input
        ref="input"
        class="input"
        type="text"
        placeholder="..."
        v-model="value"
        @keyup.enter="emit('done', value)"
        @keyup.esc="emit('cancel')"
      />
      <div class="buttons">
        <button class="button is-small" @click="emit('cancel')">
          <FontAwesomeIcon :icon="faTimes" size="sm" />
        </button>
        <button class="button is-small" @click="emit('done', value)">
          <FontAwesomeIcon :icon="faCheck" size="sm" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from 'vue';

import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps({
  name: {
    type: String,
    required: false,
    default: String(),
  },
});

const emit = defineEmits<{
  (e: 'done', name: string): void;
  (e: 'cancel'): void;
}>();

const value = ref<string>(props.name);
const input = useTemplateRef('input');

onMounted(() => {
  input.value?.scrollIntoView({ behavior: 'smooth' });
  input.value?.focus();
});
</script>

<style lang="scss" scoped>
.tree-input.field {
  position: relative;
  margin-bottom: 0; // bulma
  z-index: 10;

  input {
    border-radius: 3px;
    padding-top: 0.3em !important; // hack for rename alignment
    padding-right: 44px !important; // hack for buttons
  }

  .buttons {
    position: absolute;
    right: 0;
    top: 1px;
    gap: 2px;

    button {
      padding: 0;
      width: 20px;
      background-color: transparent;
      box-shadow: none;
    }
  }
}
</style>
