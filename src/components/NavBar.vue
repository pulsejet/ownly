<template>
  <aside class="menu main-nav has-background-primary soft-if-dark">
    <div class="top-sheet">
      <router-link to="/" v-slot="{ navigate }">
        <img alt="logo" class="logo" src="@/assets/logo-white.svg" @click="navigate" />
      </router-link>

      <!-- non-workspace general routes -->
      <template v-if="routeIsDashboard">
        <p class="menu-label">General</p>
        <ul class="menu-list">
          <li><router-link to="/">Dashboard</router-link></li>
        </ul>
      </template>

      <template v-if="routeIsWorkspace">
        <p class="menu-label">Projects</p>
        <ul class="menu-list">
          <li v-for="proj in projects" :key="proj.uuid">
            <router-link :to="linkProject(proj)">
              <div class="link-inner">
                <FontAwesomeIcon class="mr-1" :icon="faLayerGroup" size="sm" />
                {{ proj.name }}
              </div>

              <ProjectTreeMenu
                v-if="activeProjectName === proj.uuid"
                class="link-button"
                :allow-new="true"
                :allow-delete="false"
                @new-file="projectTree?.[0]?.newHere('file', $event)"
                @new-folder="projectTree?.[0]?.newHere('folder')"
                @import="projectTree?.[0]?.importHere()"
                @import-zip="projectTree?.[0]?.importZipHere()"
                @export="projectTree?.[0]?.executeExport(null)"
              />
            </router-link>

            <ProjectTree
              v-if="activeProjectName == proj.uuid"
              class="outermost"
              ref="projectTree"
              :project="proj"
              :files="projectFiles"
            />
          </li>

          <li>
            <a @click="showProjectModal = true">
              <FontAwesomeIcon class="mr-1" :icon="faPlus" size="sm" />
              Add project
            </a>
          </li>
        </ul>

        <p class="menu-label">Discussion</p>
        <ul class="menu-list">
          <li v-for="chan in channels" :key="chan.uuid">
            <router-link :to="linkDiscuss(chan)">
              <FontAwesomeIcon class="mr-1" :icon="faHashtag" size="sm" />
              {{ chan.name }}
            </router-link>
          </li>
          <li>
            <a @click="showChannelModal = true">
              <FontAwesomeIcon class="mr-1" :icon="faPlus" size="sm" />
              Add channel
            </a>
          </li>
        </ul>
        <p class="menu-label">
          <a @click="showInvite = !showInvite">
            <FontAwesomeIcon class="mr-1" :icon="faPlus" size="sm"/>
            Invite Someone
          </a>
          <template v-if="showInvite">
          <input
            :class="{ input: true }"
            inputmode="email"
            autocomplete="email"
            type="email"
            placeholder="name@email.com"
            v-model="inviteeEmail"
            @keyup.enter="inviteEmail"
          />
            <button class="button mt-1 is-fullwidth" @click="inviteEmail">Invite</button>
          </template>
        </p>
      </template>
    </div>

    <div class="bottom-sheet">
      <div class="connection">
        <template v-if="connState.connected">
          <FontAwesomeIcon class="mr-1" :icon="faWifi" size="sm" />
          {{ connState.router }}
        </template>
        <template v-else>
          <FontAwesomeIcon class="mr-1" :icon="faGhost" size="sm" />
          Offline
        </template>
      </div>
    </div>

    <AddChannelModal :show="showChannelModal" @close="showChannelModal = false" />
    <AddProjectModal :show="showProjectModal" @close="showProjectModal = false" />
  </aside>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useTemplateRef } from 'vue';
import { useRoute } from 'vue-router';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faLayerGroup,
  faPlus,
  faHashtag,
  faWifi,
  faGhost,
} from '@fortawesome/free-solid-svg-icons';

import ProjectTree from './ProjectTree.vue';
import ProjectTreeMenu from './ProjectTreeMenu.vue';
import AddChannelModal from './AddChannelModal.vue';
import AddProjectModal from './AddProjectModal.vue';

import { GlobalBus } from '@/services/event-bus';
import { Toast } from '@/utils/toast';
import {validateEmail, convertEmailToName} from "@/utils";

import type { IChatChannel, IProject, IProjectFile } from '@/services/types';

const inviteeEmail = ref(String());
const showInvite = ref(false);

function inviteEmail() {
  console.log(inviteeEmail.value);
  if (!showInvite.value) {
    return;
  }

  if (!inviteeEmail.value) {
    console.error("Email invite submitted without value");
    return;
  }

  if (!validateEmail(inviteeEmail.value)) {
    console.error("invited email is not valid");
    return;
  }
  const converted = convertEmailToName(inviteeEmail.value);
  console.log(converted);
  showInvite.value = false;
  return true;
}
const route = useRoute();
const routeIsDashboard = computed(() => route.name === 'dashboard');
const routeIsWorkspace = computed(() =>
  ['space-home', 'project', 'discuss', 'project-file'].includes(String(route.name)),
);

// vue-tsc chokes on this type inference
const projectTree = useTemplateRef<Array<InstanceType<typeof ProjectTree>>>('projectTree');

const channels = ref([] as IChatChannel[]);
const showChannelModal = ref(false);

const projects = ref([] as IProject[]);
const showProjectModal = ref(false);
const activeProjectName = ref(null as string | null);
const projectFiles = ref([] as IProjectFile[]);

const connState = ref(globalThis._ndnd_conn_state);

const busListeners = {
  'project-list': (projs: IProject[]) => (projects.value = projs),
  'project-files': (name: string, files: IProjectFile[]) => {
    activeProjectName.value = name;
    projectFiles.value = files;
  },
  'chat-channels': (chans: IChatChannel[]) => (channels.value = chans),
  'conn-change': () => {
    connState.value = globalThis._ndnd_conn_state;
    if (!connState.value.connected) {
      Toast.info('Disconnected - you are offline');
    }
  },
};

onMounted(async () => {
  GlobalBus.addListener('project-list', busListeners['project-list']);
  GlobalBus.addListener('project-files', busListeners['project-files']);
  GlobalBus.addListener('chat-channels', busListeners['chat-channels']);
  GlobalBus.addListener('conn-change', busListeners['conn-change']);
});

onUnmounted(() => {
  GlobalBus.removeListener('project-list', busListeners['project-list']);
  GlobalBus.removeListener('project-files', busListeners['project-files']);
  GlobalBus.removeListener('chat-channels', busListeners['chat-channels']);
  GlobalBus.removeListener('conn-change', busListeners['conn-change']);
});

/** Link to project home page */
function linkProject(project: IProject) {
  return {
    name: 'project',
    params: {
      space: route.params.space,
      project: project.name,
    },
  };
}

/** Link to discussion channel */
function linkDiscuss(channel: IChatChannel) {
  return {
    name: 'discuss',
    params: {
      space: route.params.space,
      channel: channel.name,
    },
  };
}
</script>

<style scoped lang="scss">
@use '@/components/navbar-item.scss';

.main-nav {
  width: 230px;
  min-width: 230px;
  height: 100dvh;
  overflow-y: hidden;

  display: flex;
  flex-direction: column;
  .top-sheet {
    padding: 10px;
    flex: 1;
    overflow-y: auto;
  }
  .bottom-sheet {
    padding: 8px 10px;
    font-size: 0.9rem;

    .connection {
      border-radius: 50px;
      padding: 5px 12px;
      color: #ddd;
      cursor: pointer;

      transition: background-color 0.2s ease;
      background-color: rgba(255, 255, 255, 0.05);
      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
    }
  }

  .logo {
    display: block;
    height: 35px;
    margin: 5px;
    margin-bottom: 15px;
  }

  .menu-label {
    color: #bbb;
  }

  :deep(li > a) {
    background-color: transparent;
    color: white;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    &.is-active,
    &.router-link-active {
      background-color: var(--highlight-on-primary-color);
      color: var(--bulma-white-on-scheme);
    }
  }
}
</style>
