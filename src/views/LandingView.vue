<template>
  <main class="has-background-primary p-2">
    <div class="landing">
      <LandingLeft class="left" />
      <LandingLogin class="login" @login="emit('login')" @ready="loginReady = true" />
    </div>

    <Transition name="fade-2" mode="out-in">
      <AboutComponent class="about" v-if="loginReady" />
    </Transition>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import AboutComponent from '@/components/landing/AboutComponent.vue';
import LandingLeft from '@/components/landing/LandingLeft.vue';
import LandingLogin from '@/components/landing/LandingLogin.vue';

const emit = defineEmits(['login']);

const loginReady = ref(false);
</script>

<style scoped lang="scss">
main {
  height: 100dvh;
  box-sizing: border-box;
  width: 100vw;
  overflow-y: auto;

  .landing {
    display: flex;
    flex-direction: row;
    height: 100dvh;
    width: 100%;
  }

  .about {
    transform: translateY(-100px);
  }
}

@media (max-width: 1023px) {
  main .landing {
    flex-direction: column;
    height: unset;
  }

  main .about {
    transform: translateY(100px);
    margin-top: 20px;
  }
}
</style>
