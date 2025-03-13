<template>
  <ModalComponent :show="show" @close="emit('close')">
    <div class="title is-5 mb-4">Share your identity</div>

    <p>
      To join a workspace, share this QR code with workspace owners so that they can invite you!
    </p>

    <img id="qr" v-bind:src="url" />

    <div class="field has-text-right">
      <div class="control">
        <button class="button mr-2" @click="emit('close')">Close</button>
      </div>
    </div>
  </ModalComponent>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import ModalComponent from './ModalComponent.vue';
import QRCode from 'qrcode';

defineProps({
  show: {
    type: Boolean,
    required: true,
  },
});
const emit = defineEmits(['close']);

const url = ref('');
ndn_api.get_identity_name().then(async (n) => {
  let u = window.location.protocol + "//" + window.location.host;
  u += "/?invite=" + encodeURIComponent(n)
  url.value = await QRCode.toDataURL(u, { scale: 7 });
});
</script>

<style scoped lang="scss">
#qr {
  margin-top: 20px;
}
</style>
