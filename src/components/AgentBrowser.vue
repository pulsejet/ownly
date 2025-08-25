<template>
  <div class="agent-browser">
    <div class="header">
      <div class="title is-5">
        <FontAwesomeIcon :icon="faRobot" class="mr-2" />
        Agent Cards
      </div>
      <div class="header-controls">
        <div class="field has-addons mr-3">
          <div class="control">
            <div class="select is-small">
              <select v-model="selectedProjectName" @change="switchProject">
                <option v-for="project in availableProjects" :key="project.name" :value="project.name">
                  {{ project.name }}
                </option>
              </select>
            </div>
          </div>
          <div class="control">
            <button class="button is-small" @click="loadAgentCards" title="Refresh">
              <FontAwesomeIcon :icon="faRefresh" />
            </button>
          </div>
        </div>
        <button class="button is-primary is-small" @click="showAddModal = true">
          <FontAwesomeIcon :icon="faPlus" class="mr-1" />
          Add Agent
        </button>
      </div>
    </div>

    <div class="tabs">
      <ul>
        <li :class="{ 'is-active': activeTab === 'workspace' }">
          <a @click="activeTab = 'workspace'">Workspace Agents</a>
        </li>
        <li :class="{ 'is-active': activeTab === 'discover' }">
          <a @click="activeTab = 'discover'">Discover</a>
        </li>
      </ul>
    </div>

    <div class="tab-content">
      <!-- Workspace Agents Tab -->
      <div v-if="activeTab === 'workspace'" class="workspace-agents">
        <div v-if="loading" class="has-text-centered py-4">
          <LoadingSpinner text="Loading agent cards..." />
        </div>

        <div v-else-if="agentCards.length === 0" class="empty-state">
          <div class="has-text-centered py-6">
            <FontAwesomeIcon :icon="faRobot" size="3x" class="has-text-grey-light mb-3" />
            <p class="has-text-grey">No agent cards found in this workspace.</p>
            <p class="has-text-grey-light">Add some agents to get started!</p>
          </div>
        </div>

        <div v-else class="agent-grid">
          <div v-for="agent in agentCards" :key="agent.name" class="agent-card">
            <div class="card">
              <div class="card-content">
                <div class="media">
                  <div class="media-left">
                    <figure class="image is-48x48">
                      <div class="agent-avatar">
                        <FontAwesomeIcon :icon="faRobot" size="lg" />
                      </div>
                    </figure>
                  </div>
                  <div class="media-content">
                    <p class="title is-6">{{ agent.name }}</p>
                    <p class="subtitle is-7 has-text-grey">
                      {{ agent.provider?.organization || 'Unknown Provider' }}
                    </p>
                  </div>
                </div>

                <div class="content">
                  <p class="description">{{ agent.description }}</p>
                  <div class="agent-details">
                    <span class="tag is-light is-small">
                      <FontAwesomeIcon :icon="faLink" class="mr-1" />
                      {{ getHostname(agent.url) }}
                    </span>
                    <span v-if="agent.version" class="tag is-light is-small ml-1">
                      v{{ agent.version }}
                    </span>
                  </div>
                </div>
              </div>
              <footer class="card-footer">
                <a class="card-footer-item" @click="addAgentChannel(agent)">
                  <FontAwesomeIcon :icon="faPlus" class="mr-1" />
                  Add Channel
                </a>
                <a class="card-footer-item" @click="testAgent(agent)">
                  <FontAwesomeIcon :icon="faFlask" class="mr-1" />
                  Test
                </a>
                <a class="card-footer-item has-text-danger" @click="removeAgent(agent)">
                  <FontAwesomeIcon :icon="faTrash" class="mr-1" />
                  Remove
                </a>
              </footer>
            </div>
          </div>
        </div>
      </div>

      <!-- Discover Tab -->
      <div v-if="activeTab === 'discover'" class="discover-agents">
        <div class="field has-addons">
          <div class="control is-expanded">
            <input
              class="input"
              type="url"
              v-model="discoverUrl"
              placeholder="Enter agent URL to discover (e.g. https://example.com)"
              @keyup.enter="discoverAgent"
            />
          </div>
          <div class="control">
            <button
              class="button is-primary"
              @click="discoverAgent"
              :class="{ 'is-loading': discovering }"
              :disabled="!discoverUrl.trim()"
            >
              <FontAwesomeIcon :icon="faSearch" class="mr-1" />
              Discover
            </button>
          </div>
        </div>

        <div v-if="discoveredAgent" class="discovered-agent mt-4">
          <div class="notification is-info">
            <button class="delete" @click="discoveredAgent = null"></button>
            <div class="media">
              <div class="media-left">
                <figure class="image is-48x48">
                  <div class="agent-avatar">
                    <FontAwesomeIcon :icon="faRobot" size="lg" />
                  </div>
                </figure>
              </div>
              <div class="media-content">
                <p class="title is-6">{{ discoveredAgent.name }}</p>
                <p class="subtitle is-7">{{ discoveredAgent.description }}</p>
                <div class="buttons mt-3">
                  <button class="button is-primary is-small" @click="addDiscoveredAgent">
                    <FontAwesomeIcon :icon="faPlus" class="mr-1" />
                    Add to Workspace
                  </button>
                  <button class="button is-small" @click="addAgentChannel(discoveredAgent)">
                    <FontAwesomeIcon :icon="faComments" class="mr-1" />
                    Create Channel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="help-section mt-4">
          <h6 class="title is-6">How to discover agents:</h6>
          <ul>
            <li>Enter the base URL of an agent server</li>
            <li>The system will look for <code>/.well-known/agent.json</code></li>
            <li>Compatible agents will be automatically detected</li>
          </ul>

          <div class="notification is-warning mt-3">
            <strong>CORS Issues?</strong> If you get a "Failed to fetch" error, the agent server doesn't allow cross-origin requests.
            You can:
            <ol class="mt-2">
              <li>Ask the agent provider to add CORS headers</li>
              <li>Use the "Add Agent" tab to manually create the agent card</li>
              <li>Copy the agent.json content from your browser and paste the details manually</li>
            </ol>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Agent Modal -->
    <AddAgentModal
      :show="showAddModal"
      @close="showAddModal = false"
    />

    <!-- Add Channel Modal -->
    <ModalComponent :show="showChannelModal" @close="showChannelModal = false">
      <div class="title is-5 mb-4">Add Agent Channel</div>

      <div class="field">
        <label class="label">Channel Name</label>
        <div class="control">
          <input
            class="input"
            type="text"
            v-model="channelName"
            :placeholder="selectedAgent?.name || 'agent-channel'"
          />
          <p class="help">Leave empty to use the agent's name</p>
        </div>
      </div>

      <div class="field has-text-right">
        <div class="control">
          <button class="button mr-2" @click="showChannelModal = false">Cancel</button>
          <button class="button is-primary soft-if-dark" @click="createAgentChannel">
            Create Channel
          </button>
        </div>
      </div>
    </ModalComponent>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faRobot,
  faPlus,
  faLink,
  faFlask,
  faTrash,
  faSearch,
  faComments,
  faRefresh
} from '@fortawesome/free-solid-svg-icons';

import LoadingSpinner from './LoadingSpinner.vue';
import AddAgentModal from './AddAgentModal.vue';
import ModalComponent from './ModalComponent.vue';

import { Workspace } from '@/services/workspace';
import { Toast } from '@/utils/toast';

import type { AgentCard } from '@/services/workspace-agent';

const router = useRouter();

// Component state
const activeTab = ref<'workspace' | 'discover'>('workspace');
const loading = ref(true);
const agentCards = ref<AgentCard[]>([]);
const showAddModal = ref(false);
const showChannelModal = ref(false);
const selectedAgent = ref<AgentCard | null>(null);
const channelName = ref('');

// Discover tab state
const discoverUrl = ref('');
const discovering = ref(false);
const discoveredAgent = ref<AgentCard | null>(null);

// Project selection state
const availableProjects = ref<{name: string, uuid: string}[]>([]);
const selectedProjectName = ref('');

onMounted(async () => {
  await loadAgentCards();
});

function getHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

async function switchProject() {
  await loadAgentCards();
}
// async function repairAgentFile(proj: any, existingMeta: any) {
//   // Delete the corrupted file entry
//   await proj.deleteFile('.well-known/agent.json');

//   // Create an empty agent.json file with proper structure
//   const emptyAgentJson = JSON.stringify([], null, 2);
//   const stream = new ReadableStream<Uint8Array>({
//     start(controller) {
//       controller.enqueue(new TextEncoder().encode(emptyAgentJson));
//       controller.close();
//     }
//   });

//   // Import the file properly
//   await proj.importFile('.well-known/agent.json', stream);
//   console.log('Agent file repaired with empty structure');
// }

async function loadAgentCards() {
  try {
    loading.value = true;
    const wksp = await Workspace.setupOrRedir(router);
    if (!wksp) return;

    // Load available projects
    const allProjects = wksp.proj.getProjects();
    availableProjects.value = allProjects;
    console.log('All projects:', allProjects.map(p => p.name));

    // Determine which project to use
    let proj = wksp.proj.active;
    let targetProjectName = selectedProjectName.value;

    // If no project selected, use active or first available
    if (!targetProjectName) {
      if (proj) {
        targetProjectName = proj.name;
      } else if (allProjects.length > 0) {
        targetProjectName = allProjects[0].name;
      }
      selectedProjectName.value = targetProjectName;
    }

    // Get the target project
    if (targetProjectName && (!proj || proj.name !== targetProjectName)) {
      proj = await wksp.proj.get(targetProjectName);
      await proj.activate();
      console.log('Switched to project:', proj.name);
    }

    console.log('Currently active project:', proj?.name || 'none');

    if (!proj) {
      agentCards.value = [];
      return;
    }

    try {
      // Check if file exists (try flat filename first)
      let agentFilePath = 'agent.json';
      let existingMeta = proj.getFileMeta(agentFilePath);

      // Debug: Check what files exist in the project
      console.log('Active project:', proj.name);
      console.log('All files in project:', proj.getFileList().map(f => f.path));
      console.log('Full file list with metadata:', proj.getFileList());

      // Let's check if other files work
      const allFiles = proj.getFileList();
      for (const file of allFiles) {
        if (file.path !== agentFilePath) {
          try {
            const testContent = await proj.exportFile(file.path);
            console.log(`File ${file.path} can be read:`, !!testContent);
          } catch (e) {
            console.log(`File ${file.path} cannot be read:`, (e as Error).message);
          }
        }
      }

      // Fallback to nested path
      if (!existingMeta) {
        agentFilePath = '.well-known/agent.json';
        existingMeta = proj.getFileMeta(agentFilePath);
      }

      console.log('Agent file path:', agentFilePath);
      console.log('Agent file meta:', existingMeta);

      if (existingMeta) {
        try {
          // Try reading directly from Y.js document
          console.log('Reading from Y.js document...');
          const doc = await proj.getFile(agentFilePath);
          const text = doc.getText('text');
          const content = text.toString();

          console.log('Y.js text content:', content);

          if (content.trim()) {
            agentCards.value = JSON.parse(content);
            console.log('Parsed agent cards:', agentCards.value);
          } else {
            console.log('Empty content in file');
            agentCards.value = [];
          }
        } catch (docError) {
          console.error('Failed to read Y.js document:', docError);

          // Fallback: try export method
          try {
            const content = await proj.exportFile(agentFilePath);
            console.log('Fallback export content:', content);

            if (content) {
              const text = new TextDecoder().decode(content);
              agentCards.value = JSON.parse(text);
            } else {
              agentCards.value = [];
            }
          } catch (exportError) {
            console.error('Both Y.js and export failed:', exportError);
            Toast.warning('Agent file found but cannot be read. The file system may be corrupted.');
            agentCards.value = [];
          }
        }
      } else {
        console.log('File not found in project');
        agentCards.value = [];
      }
    } catch (error) {
      console.error('Error loading agent cards:', error);
      agentCards.value = [];
    }
  } catch (error) {
    console.error('Failed to load agent cards:', error);
    Toast.error('Failed to load agent cards');
  } finally {
    loading.value = false;
  }
}

async function discoverAgent() {
  if (!discoverUrl.value.trim()) return;

  try {
    discovering.value = true;
    const wksp = await Workspace.setupOrRedir(router);
    if (!wksp) return;

    discoveredAgent.value = await wksp.agent.discoverAgent(discoverUrl.value.trim());
    Toast.success(`Discovered agent: ${discoveredAgent.value.name}`);
  } catch (error) {
    console.error('Discovery failed:', error);
    Toast.error(`Failed to discover agent: ${error}`);
    discoveredAgent.value = null;
  } finally {
    discovering.value = false;
  }
}

async function addDiscoveredAgent() {
  if (!discoveredAgent.value) return;

  try {
    const wksp = await Workspace.setupOrRedir(router);
    if (!wksp) return;

    let proj = wksp.proj.active;
    if (!proj) {
      // Try to get the first available project
      const projects = wksp.proj.getProjects();
      if (projects.length > 0) {
        const firstProj = await wksp.proj.get(projects[0].name);
        await firstProj.activate();
        proj = firstProj;
        Toast.info(`Activated project "${projects[0].name}" for you.`);
      } else {
        Toast.error('No projects found. Please create a project first by clicking "Add project" in the sidebar.');
        return;
      }
    }

    // Get current agent cards
    let cards: AgentCard[] = [];
    try {
      // Use the same file path logic
      let agentFilePath = 'agent.json';
      let existingMeta = proj.getFileMeta(agentFilePath);
      if (!existingMeta) {
        agentFilePath = '.well-known/agent.json';
        existingMeta = proj.getFileMeta(agentFilePath);
      }

      if (existingMeta) {
        const content = await proj.exportFile(agentFilePath);
        if (content) {
          const text = new TextDecoder().decode(content);
          cards = JSON.parse(text);
        }
      }
    } catch {
      cards = [];
    }

    // Check for duplicates
    if (cards.some(card => card.name === discoveredAgent.value!.name)) {
      Toast.error('Agent with this name already exists');
      return;
    }

    // Add the discovered agent
    cards.push(discoveredAgent.value);

    // Create the JSON content
    const jsonContent = JSON.stringify(cards, null, 2);
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(jsonContent));
        controller.close();
      }
    });

    // Save to file (use flat path)
    await proj.importFile('agent.json', stream);

    // Reload the list
    await loadAgentCards();

    Toast.success(`Added agent "${discoveredAgent.value.name}" to workspace`);
    discoveredAgent.value = null;
    discoverUrl.value = '';
    activeTab.value = 'workspace';
  } catch (error) {
    console.error('Failed to add agent:', error);
    Toast.error(`Failed to add agent: ${error}`);
  }
}

async function addAgentChannel(agent: AgentCard) {
  selectedAgent.value = agent;
  channelName.value = '';
  showChannelModal.value = true;
}

async function createAgentChannel() {
  if (!selectedAgent.value) return;

  try {
    const wksp = await Workspace.setupOrRedir(router);
    if (!wksp) return;

    const name = channelName.value.trim() || selectedAgent.value.name;

    await wksp.agent.addAgentChannel(selectedAgent.value, name);

    Toast.success(`Created agent channel: ${name}`);
    showChannelModal.value = false;
    channelName.value = '';
    selectedAgent.value = null;
  } catch (error) {
    console.error('Failed to create agent channel:', error);
    Toast.error(`Failed to create channel: ${error}`);
  }
}

async function testAgent(agent: AgentCard) {
  try {
    Toast.info(`Testing connection to ${agent.name}...`);

    const response = await fetch(`${agent.url}/.well-known/agent.json`);
    if (response.ok) {
      Toast.success(`✅ ${agent.name} is responding correctly`);
    } else {
      Toast.warning(`⚠️ ${agent.name} returned status ${response.status}`);
    }
  } catch (error) {
    Toast.error(`Failed to connect to ${agent.name}: ${error}`);
  }
}

async function removeAgent(agent: AgentCard) {
  if (!confirm(`Are you sure you want to remove "${agent.name}" from this workspace?`)) {
    return;
  }

  try {
    const wksp = await Workspace.setupOrRedir(router);
    if (!wksp) return;

    const proj = wksp.proj.active;
    if (!proj) return;

    // Remove from the list
    const updatedCards = agentCards.value.filter(card => card.name !== agent.name);

    // Create the JSON content
    const jsonContent = JSON.stringify(updatedCards, null, 2);
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(jsonContent));
        controller.close();
      }
    });

    // Save updated list (use flat path)
    await proj.importFile('agent.json', stream);

    // Update local state
    agentCards.value = updatedCards;

    Toast.success(`Removed agent "${agent.name}"`);
  } catch (error) {
    console.error('Failed to remove agent:', error);
    Toast.error(`Failed to remove agent: ${error}`);
  }
}
</script>

<style scoped lang="scss">
.agent-browser {
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    .header-controls {
      display: flex;
      align-items: center;
    }
  }

  .tab-content {
    margin-top: 1rem;
  }

  .agent-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }

  .agent-card {
    .card {
      height: 100%;
      display: flex;
      flex-direction: column;

      .card-content {
        flex: 1;
      }

      .description {
        font-size: 0.875rem;
        line-height: 1.4;
        margin-bottom: 0.75rem;
      }

      .agent-details {
        margin-top: 0.5rem;
      }
    }
  }

  .agent-avatar {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .empty-state {
    .fa-robot {
      opacity: 0.3;
    }
  }

  .help-section {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 6px;
    border-left: 4px solid #3273dc;

    ul {
      margin-left: 1rem;

      li {
        margin-bottom: 0.25rem;
      }
    }

    code {
      background: #e8e8e8;
      padding: 0.125rem 0.25rem;
      border-radius: 3px;
      font-size: 0.875rem;
    }
  }

  .discovered-agent {
    .agent-avatar {
      background: linear-gradient(135deg, #48c78e 0%, #06d6a0 100%);
    }
  }
}
</style>
