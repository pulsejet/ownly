<template>
  <div class="outer py-4">
    <LoadingSpinner v-if="!proj" class="absolute-center" text="Loading your project ..." />

    <template v-else>
      <section class="hero project-ready">
        <div class="hero-body">
          <p class="title">
            <FontAwesomeIcon class="mr-1" :icon="faLayerGroup" size="sm" />
            {{ projName }}
          </p>
          <p class="subtitle mt-4">
            Your project is ready to go! <br />
            Select or add a file from the sidebar to get started.
          </p>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, shallowRef, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';

import LoadingSpinner from '@/components/LoadingSpinner.vue';

import { Workspace } from '@/services/workspace';
import { Toast } from '@/utils/toast';

import type { WorkspaceProj } from '@/services/workspace-proj';
import { formTabName } from '@/utils';

const route = useRoute();
const router = useRouter();

const projName = computed(() => route.params.project as string);
const proj = shallowRef(null as WorkspaceProj | null);

onMounted(setup);
watch(projName, setup);

async function setup() {
  try {
    const wksp = await Workspace.setupOrRedir(router);
    if (!wksp) return;

    proj.value = await wksp.proj.get(projName.value);
    if (!proj.value) return;

    // Update tab name
    document.title = formTabName(wksp.metadata.label);

    await proj.value.activate();
  } catch (err) {
    console.error(err);
    Toast.error(`Failed to load project: ${err}`);
  }
}
</script>

<style scoped lang="scss">
.outer {
  position: relative;
  user-select: none;
  height: 100%;
}
.project-ready .subtitle {
  line-height: 1.8em;
}
</style>
