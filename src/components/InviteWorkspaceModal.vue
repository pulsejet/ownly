<template>
  <ModalComponent :show="show" @close="emit('close')">
    <div class="title is-5 mb-4">Invite user</div>

    <p>Select a workspace to invite {{ name }}.</p>

    <div class="spacelist">
      <span v-if="workspaces.length == 0">Join or create workspaces before inviting users.</span>
      <template v-else v-for="ws in workspaces" :key="ws.name">
        <WorkspaceCard
          v-if="ws.name != '__create__'"
          :metadata="ws"
          :simple="true"
          @open="invite(ws)"
        />
      </template>
    </div>

    <div class="field has-text-right">
      <div class="control">
        <button class="button mr-2" @click="emit('close')">Cancel</button>
      </div>
    </div>
  </ModalComponent>
</template>

<script setup lang="ts">
import { type PropType } from 'vue';

import ModalComponent from './ModalComponent.vue';
import WorkspaceCard from '@/components/home/WorkspaceCard.vue';
import type { IWkspStats } from '@/services/types';
import { Toast } from '@/utils/toast';
import { Workspace } from '@/services/workspace';

defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  workspaces: {
    type: Object as PropType<IWkspStats[]>,
    required: true,
  },
});

const emit = defineEmits(['close']);

const urlParams = new URLSearchParams(window.location.search);
const name = decodeURIComponent(urlParams.get('invite')!);

const invite = async (ws: IWkspStats) => {
  try {
    // Generate and publish invitation to sync
    const wksp = await Workspace.setup(ws.name, true);
    await wksp.invite.invite(name);
    console.log(wksp.metadata.name);
    console.log(name);
  } catch (err) {
    Toast.error(`Failed to invite ${name}: ${err}`);
    return; // rare
  }

  Toast.success(`Invited ${name} to workspace!`);
  emit('close');
};
</script>

<style scoped lang="scss">
#qr {
  margin-top: 20px;
}
</style>
