<template>
  <div class="outer has-background-primary soft-if-dark">
    <div class="inner">
      <section class="hero">
        <div class="hero-body pb-1">
          <p class="title has-text-white">Dashboard</p>
          <p class="subtitle mt-2 has-text-white">
            You can create or join one or more workspaces below
          </p>
        </div>
      </section>

      <div class="spacelist">
        <template v-for="ws in workspaces" :key="ws.name">
          <!-- Create workspace card -->
          <div class="create card" v-if="ws.name === '__create__'">
            <div class="card-content">
              <div class="block">
                <div class="media-content">
                  <p class="subtitle is-5">Don't see what you are looking for?</p>
                </div>
              </div>

              <div class="content has-text-right">
                <button class="button mr-2 mb-2 is-small-caps" @click="showCreate = true">
                  Create a new workspace
                </button>
                <button
                  class="button mr-2 is-primary is-small-caps soft-if-dark"
                  @click="showJoin = true"
                >
                  Join a workspace
                </button>
              </div>
            </div>
          </div>

          <!-- Normal workspace card -->
          <WorkspaceCard v-else :metadata="ws" @open="open(ws)" @leave="refreshList" />
        </template>
      </div>
    </div>

    <CreateWorkspaceModal :show="showCreate" @close="showCreate = false" @create="openByName" />
    <JoinWorkspaceModal :show="showJoin" @close="showJoin = false" @join="openByName" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import CreateWorkspaceModal from '@/components/home/CreateWorkspaceModal.vue';
import JoinWorkspaceModal from '@/components/home/JoinWorkspaceModal.vue';
import WorkspaceCard from '@/components/home/WorkspaceCard.vue';

import * as utils from '@/utils';
import type { IWkspStats } from '@/services/types';

const router = useRouter();

const showCreate = ref(false);
const showJoin = ref(false);
const workspaces = ref([] as IWkspStats[]);

async function refreshList() {
  workspaces.value = await _o.stats.list();
  workspaces.value.sort((a, b) => {
    return (b.lastAccess ?? 0) - (a.lastAccess ?? 0);
  });

  // Insert a create workspace card
  workspaces.value.splice(1, 0, {
    name: '__create__',
  } as IWkspStats);
}

onMounted(() => {
  refreshList();
});

function open(ws: IWkspStats) {
  router.push({
    name: 'space-home',
    params: {
      space: utils.escapeUrlName(ws.name),
    },
  });
}

async function openByName(name: string) {
  await refreshList();
  const ws = workspaces.value.find((w) => w.name === name);
  if (ws) open(ws);
}
</script>

<style scoped lang="scss">
.outer {
  height: 100%;
  width: auto;
  overflow-y: auto;

  .inner {
    max-width: 900px;
    margin: 0 auto;
  }

  .spacelist {
    margin: 40px;
  }
}

.card.create {
  box-shadow: none;
}

@media (max-width: 1023px) {
  .outer .spacelist {
    margin: 20px;
  }
}
</style>
