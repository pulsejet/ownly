<template>
  <div class="outer py-4">
    <LoadingSpinner v-if="!wksp" class="absolute-center" text="Loading your workspace ..." />

    <template v-else>
      <section class="hero project-ready">
        <div class="hero-body">
          <p class="title">
            <FontAwesomeIcon class="mr-1" :icon="faBriefcase" size="sm" />
            {{ wksp.metadata.label }}
          </p>

          <p class="subtitle mt-4">
            <template v-if="!showWelcome">
              <b>Your workspace is ready! 🎉 </b><br />
              Select or create a project from the sidebar to get started.
            </template>

            <template v-else>
              <b> Welcome to your new workspace! 🎉</b> <br />
              Create a new project or discussion channel from the sidebar to get started. <br />
              For your convenience, we've created some default channels and a project for you.
            </template>
          </p>

          📂 Projects are where you organize your documents and collaborate with others.<br />
          💬 Discussion channels are where you can chat with your team.
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue';
import { useRouter } from 'vue-router';

import { faBriefcase } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import LoadingSpinner from '@/components/LoadingSpinner.vue';

import { Workspace } from '@/services/workspace';
import { formTabName } from '@/utils';

const router = useRouter();

const wksp = shallowRef(null as Workspace | null);
const showWelcome = ref(false);

onMounted(setup);

async function setup() {
  wksp.value = await Workspace.setupOrRedir(router);
  if (!wksp.value) return;

  // Update tab name
  document.title = formTabName(wksp.value.metadata.label);

  if (wksp.value.metadata.pendingSetup) {
    showWelcome.value = true;

    // Create default channels
    for (const name of ['general', 'random']) {
      try {
        await wksp.value.chat.newChannel({
          uuid: String(), // auto
          name: name,
        });
      } catch (err) {
        console.warn('Failed to create channel', err);
      }
    }

    // Create default project
    try {
      const projectName = 'documents';
      await wksp.value.proj.newProject(projectName);

      // Load the project
      const project = await wksp.value.proj.get(projectName);
      const content = `# ${wksp.value.metadata.label}

Welcome to your new workspace! 🎉

You can collaborate on files in projects in real time.
Try creating a new document or importing an existing one.
Invite people to your workspace to start collaborating!
`;

      const contentBlob = new Blob([content], { type: 'text/markdown' });
      await project.importFile('readme.md', contentBlob.stream());

      await project.activate();
    } catch (err) {
      console.warn('Failed to create project', err);
    }

    // Mark setup as complete
    const metadata = wksp.value.metadata;
    metadata.pendingSetup = false;
    await _o.stats.put(metadata.name, metadata);
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
