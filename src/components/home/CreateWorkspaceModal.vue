<template>
  <ModalComponent :show="show" :loading="loading" @close="close">
    <div class="title is-5 mb-4">Create Workspace</div>

    <div class="field">
      <label class="label">Dashboard Label</label>
      <div class="control">
        <input
          class="input"
          type="text"
          placeholder="Marketing Team"
          v-model="opts.label"
          autofocus
        />
      </div>
      <p class="help">A human-readable title for the workspace on your dashboard</p>
    </div>

    <div class="field">
      <label class="label">NDN Name</label>
      <div class="control">
        <input
          class="input"
          type="text"
          placeholder="/org/division/team/workspace"
          v-model="opts.name"
        />
      </div>
      <p class="help">A unique NDN name identifier for the workspace, structured like a path</p>
    </div>

    <div class="field has-text-right">
      <div class="control">
        <button class="button is-light mr-2" @click="close">Cancel</button>
        <button class="button is-primary" @click="create">Create</button>
      </div>
    </div>
  </ModalComponent>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import ModalComponent from '../ModalComponent.vue';

import ndn from '@/services/ndn';
import { Toast } from '@/utils/toast';

defineProps({
  show: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'create', name: string): void;
}>();

const loading = ref(false);

const opts = ref({
  label: String(),
  name: String(),
});

async function create() {
  try {
    loading.value = true;

    const name = await ndn.api.create_workspace(opts.value.name);

    await _o.stats.put(name, {
      label: opts.value.label,
      name: name,
      owner: true,
      pendingSetup: true,
    });

    emit('create', name);
    emit('close');

    Toast.success('Created workspace successfully!');
  } catch (err) {
    console.error(err);
    Toast.error(`Error creating workspace: ${err}`);
  } finally {
    loading.value = false;
  }
}

function close() {
  loading.value = false;
  emit('close');
}
</script>

<style scoped lang="scss"></style>
