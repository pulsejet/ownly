<template>
  <ModalComponent :show="show" @close="emit('close')">
    <div class="title is-5 mb-4">Add Agent Card</div>

    <div class="field">
      <label class="label">Name *</label>
      <div class="control">
        <input
          autofocus
          class="input"
          type="text"
          placeholder="e.g. Code Assistant"
          v-model="form.name"
          @keyup.enter="create"
        />
        <p class="help">Human readable name for the agent</p>
      </div>
    </div>

    <div class="field">
      <label class="label">Description *</label>
      <div class="control">
        <textarea
          class="textarea"
          rows="3"
          placeholder="Brief description of what this agent does"
          v-model="form.description"
        ></textarea>
        <p class="help">Short description of the agent's capabilities</p>
      </div>
    </div>

    <div class="field">
      <label class="label">URL *</label>
      <div class="control">
        <input
          class="input"
          type="url"
          placeholder="https://example.com"
          v-model="form.url"
        />
        <p class="help">Base URL where the agent is hosted (without trailing slash)</p>
      </div>
    </div>

    <div class="field">
      <label class="label">Provider Organization</label>
      <div class="control">
        <input
          class="input"
          type="text"
          placeholder="e.g. Acme Corp"
          v-model="form.providerOrganization"
        />
        <p class="help">Optional: Organization that owns this agent</p>
      </div>
    </div>

    <div class="field">
      <label class="label">Provider URL</label>
      <div class="control">
        <input
          class="input"
          type="url"
          placeholder="https://acme.com"
          v-model="form.providerUrl"
        />
        <p class="help">Optional: Website for the organization</p>
      </div>
    </div>

    <div class="field">
      <label class="label">A2A Protocol Version</label>
      <div class="control">
        <input
          class="input"
          type="text"
          placeholder="1.0"
          v-model="form.version"
        />
        <p class="help">Optional: A2A protocol version implemented by the agent</p>
      </div>
    </div>

    <div class="field">
      <label class="label">Custom Fields</label>
      <div class="control">
        <div v-for="(field, index) in customFields" :key="index" class="field is-grouped mb-2">
          <div class="control is-expanded">
            <input
              class="input"
              type="text"
              placeholder="Key"
              v-model="field.key"
            />
          </div>
          <div class="control is-expanded">
            <input
              class="input"
              type="text"
              placeholder="Value"
              v-model="field.value"
            />
          </div>
          <div class="control">
            <button class="button is-danger" @click="removeCustomField(index)">
              <FontAwesomeIcon :icon="faTrash" />
            </button>
          </div>
        </div>
        <button class="button is-small" @click="addCustomField">
          <FontAwesomeIcon :icon="faPlus" class="mr-1" />
          Add Field
        </button>
        <p class="help">Optional: Additional custom properties for the agent card</p>
      </div>
    </div>

    <div class="field has-text-right">
      <div class="control">
        <button class="button mr-2" @click="emit('close')">Cancel</button>
        <button class="button is-primary soft-if-dark" @click="create">Add Agent</button>
      </div>
    </div>
  </ModalComponent>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

import ModalComponent from './ModalComponent.vue';

import { Workspace } from '@/services/workspace';
import { Toast } from '@/utils/toast';

import type { AgentCard } from '@/services/workspace-agent';

defineProps({
  show: {
    type: Boolean,
    required: true,
  },
});
const emit = defineEmits(['close']);
const router = useRouter();

const form = reactive({
  name: '',
  description: '',
  url: '',
  providerOrganization: '',
  providerUrl: '',
  version: '',
});

const customFields = ref<{ key: string; value: string }[]>([]);

function addCustomField() {
  customFields.value.push({ key: '', value: '' });
}

function removeCustomField(index: number) {
  customFields.value.splice(index, 1);
}

async function create() {
  try {
    // Validate required fields
    if (!form.name.trim()) {
      Toast.error('Agent name is required');
      return;
    }
    if (!form.description.trim()) {
      Toast.error('Agent description is required');
      return;
    }
    if (!form.url.trim()) {
      Toast.error('Agent URL is required');
      return;
    }

    // Validate URL format
    try {
      new URL(form.url);
    } catch {
      Toast.error('Please enter a valid URL');
      return;
    }

    // Get workspace
    const wksp = await Workspace.setupOrRedir(router);
    if (!wksp) return;

    // Build agent card
    const agentCard: AgentCard = {
      name: form.name.trim(),
      description: form.description.trim(),
      url: form.url.trim().replace(/\/+$/, ''), // Remove trailing slashes
    };

    // Add optional provider info
    if (form.providerOrganization.trim() || form.providerUrl.trim()) {
      agentCard.provider = {};
      if (form.providerOrganization.trim()) {
        agentCard.provider.organization = form.providerOrganization.trim();
      }
      if (form.providerUrl.trim()) {
        agentCard.provider.url = form.providerUrl.trim();
      }
    }

    // Add version if provided
    if (form.version.trim()) {
      agentCard.version = form.version.trim();
    }

    // Add custom fields
    for (const field of customFields.value) {
      if (field.key.trim() && field.value.trim()) {
        agentCard[field.key.trim()] = field.value.trim();
      }
    }

    // Save agent card to workspace's .well-known/agent.json
    await saveAgentCardToWorkspace(wksp, agentCard);

    Toast.success(`Agent card "${form.name}" added successfully`);
    emit('close');
    resetForm();
  } catch (err) {
    console.error(err);
    Toast.error(`${err}`);
  }
}

async function saveAgentCardToWorkspace(wksp: Workspace, agentCard: AgentCard) {
  try {
    // Get the active project
    const proj = wksp.proj.active;
    if (!proj) {
      // Try to get the first available project
      const projects = wksp.proj.getProjects();
      if (projects.length > 0) {
        const firstProj = await wksp.proj.get(projects[0].name);
        await firstProj.activate();
        throw new Error(`No active project found. Activated "${projects[0].name}" for you. Please try again.`);
      } else {
        throw new Error('No projects found. Please create a project first by clicking "Add project" in the sidebar.');
      }
    }

    // Get current agent.json content or create empty array using Y.js document
    let agentCards: AgentCard[] = [];
    const agentFilePath = 'agent.json';
    
    try {
      // Check if file exists, if not create it
      const existingMeta = proj.getFileMeta(agentFilePath);
      if (!existingMeta) {
        console.log('Creating new agent.json file...');
        await proj.newFile(agentFilePath, false); // false = text file, not blob
      }
      
      // Read existing content from Y.js document directly
      const doc = await proj.getFile(agentFilePath);
      const text = doc.getText('text');
      const existingContent = text.toString();
      
      if (existingContent.trim()) {
        agentCards = JSON.parse(existingContent);
      }
      
      // Don't destroy the doc yet - we'll reuse it below
      doc.destroy();
    } catch (error) {
      console.warn('Error reading existing agent cards:', error);
      // File doesn't exist or is invalid, start with empty array
      agentCards = [];
    }

    // Check for duplicate names
    if (agentCards.some(card => card.name === agentCard.name)) {
      throw new Error('An agent card with this name already exists');
    }

    // Add new agent card
    agentCards.push(agentCard);

    // Ensure file exists for writing (reuse the same path)
    const existingMeta = proj.getFileMeta(agentFilePath);
    if (!existingMeta) {
      console.log('Creating new agent.json file during save...');
      await proj.newFile(agentFilePath, false); // false = text file, not blob
    }
    
    // Get the Y.js document and directly set the text content
    const doc = await proj.getFile(agentFilePath);
    const text = doc.getText('text');
    const jsonContent = JSON.stringify(agentCards, null, 2);
    
    // Update the text content directly
    doc.transact(() => {
      text.delete(0, text.length);
      text.insert(0, jsonContent);
    });
    
    console.log('Agent file updated with Y.js text document');
  } catch (error) {
    throw new Error(`Failed to save agent card: ${error}`);
  }
}

function resetForm() {
  form.name = '';
  form.description = '';
  form.url = '';
  form.providerOrganization = '';
  form.providerUrl = '';
  form.version = '';
  customFields.value = [];
}
</script>