<template>
  <ModalComponent :show="show" :loading="loading" @close="close">
    <div class="title is-5 mb-4">Join Workspace</div>

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
      <p class="help">The creator of the workspace should know this</p>
    </div>

    <div class="field has-text-right">
      <div class="control">
        <button class="button is-light mr-2" @click="close">Cancel</button>
        <button class="button is-primary" @click="join">Join</button>
      </div>
    </div>
  </ModalComponent>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ModalComponent from '../ModalComponent.vue';
import { Toast } from '@/utils/toast';

defineProps({
  show: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'join', name: string): void;
}>();

const loading = ref(false);

const opts = ref({
  label: String(),
  name: String(),
});

async function join() {
  try {
    loading.value = true;

    // TODO: fetch label etc from network
    // TODO: Make sure the workspace exists
    // TODO: Check invitation
    await _o.stats.put(opts.value.name, {
      label: opts.value.label,
      name: opts.value.name,
      owner: false,
    });

    emit('join', opts.value.name);
    emit('close');

    Toast.success('Joined workspace successfully!');
  } catch (err) {
    console.error(err);
    Toast.error(`Error joining workspace: ${err}`);
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
