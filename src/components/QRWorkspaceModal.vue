<template>
  <ModalComponent :show="show" @close="emit('close')">
    <div class="title is-5 mb-4">Share this workspace</div>

    <p>To let others join this workspace, share this QR code!</p>

    <img id="qr" v-bind:src="url" />

    <div class="field has-text-right">
      <div class="control">
        <button class="button mr-2" @click="emit('close')">Close</button>
      </div>
    </div>
  </ModalComponent>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

import ModalComponent from './ModalComponent.vue';
import QRCode from 'qrcode';

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
});
const emit = defineEmits(['close']);
const url = ref('');

watch(
  () => props.show,
  async () => {
    let u = window.location.protocol + '//';
    u += window.location.host + '/?';
    u += "label=" + encodeURIComponent(ActiveWorkspace!.metadata.label);
    u += "&join=" + encodeURIComponent(ActiveWorkspace!.metadata.name);
    QRCode.toDataURL(u, { scale: 7 }).then((qr) => (url.value = qr));
  },
);
</script>

<style scoped lang="scss">
#qr {
  margin-top: 20px;
}
</style>
