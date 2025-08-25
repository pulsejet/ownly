<template>
  <div class="outer pb-4">
    <LoadingSpinner v-if="!items" class="absolute-center" text="Loading your messages ..." />

    <template v-else>
      <DynamicScroller
        class="scroller"
        ref="scroller"
        :items="items"
        :min-item-size="15"
        key-field="uuid"
        @scroll-end="unreadCount = 0"
      >
        <template #before>
          <div class="title px-4 py-4">#{{ channelName }}</div>
        </template>

        <template #default="{ item, index, active }">
          <DynamicScrollerItem
            :item="item"
            :active="active"
            :data-index="index"
            :data-active="active"
            class="chat-message"
          >
            <div
              :class="{
                'px-4': true,
                'pt-2': !skipHeader(item, index),
                'pb-1': true,
              }"
            >
              <div class="holder">
                <div class="avatar">
                  <img
                    v-if="!skipHeader(item, index)"
                    :src="utils.makeAvatar(item.user)"
                    :key="item.user"
                    alt="avatar"
                  />
                </div>

                <div class="message">
                  <div class="header" v-if="!skipHeader(item, index)">
                    <span class="name" :class="{ 'is-agent': isAgentMessage(item) }">
                      {{ item.user }}
                      <span v-if="isAgentMessage(item)" class="tag is-small is-info ml-1">AI</span>
                    </span>
                    <span class="time">{{ formatTime(item) }}</span>
                  </div>

                  <div class="content" 
                       :class="{ 'agent-message': isAgentMessage(item) }"
                       v-html="marked(item.message)">
                  </div>
                </div>
              </div>
            </div>
          </DynamicScrollerItem>
        </template>
      </DynamicScroller>

      <div class="chatbox mt-2 px-4">
        <textarea
          ref="chatbox"
          class="textarea"
          rows="2"
          placeholder="Send a message to start discussing!"
          v-model="outMessage"
          @keydown.enter="send"
        ></textarea>
        <button class="button mt-2 send" @click="send">
          <FontAwesomeIcon :icon="faPaperPlane" />
        </button>
      </div>

      <Transition name="fade-2">
        <div
          class="new-unread tag is-primary"
          v-if="unreadCount > 0"
          @click="(scroller?.scrollToBottom(), (unreadCount = 0))"
        >
          <span class="mr-2">{{ unreadCount }} Unread Messages</span>
          <FontAwesomeIcon :icon="faArrowDown" />
        </div>
      </Transition>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  useTemplateRef,
  watch,
} from 'vue';

import { useRoute, useRouter } from 'vue-router';

import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faPaperPlane, faArrowDown } from '@fortawesome/free-solid-svg-icons';

import LoadingSpinner from '@/components/LoadingSpinner.vue';

import { Workspace } from '@/services/workspace';
import * as utils from '@/utils';
import { Toast } from '@/utils/toast';

import type { IChatMessage } from '@/services/types';
import type { AgentMessage, AgentChannel } from '@/services/workspace-agent';
import { marked } from 'marked';
import 'highlight.js/styles/vs.min.css';

const route = useRoute();
const router = useRouter();

// Route state
const channelName = computed(() => route.params.channel as string);

// Element references
const scroller = useTemplateRef<typeof DynamicScroller>('scroller');
const chatbox = useTemplateRef('chatbox');

// Data state
const wksp = shallowRef(null as Workspace | null);
const items = ref(null as (IChatMessage | AgentMessage)[] | null);
const outMessage = ref(String());
const isAgentChannel = ref(false);
const currentAgentChannel = ref(null as AgentChannel | null);

// Show the unread scroll button if the user is not at the bottom
const unreadCount = ref(0);

onMounted(async () => {
  await setup();

  // Subscribe to chat messages
  wksp.value?.chat.events.addListener('chat', onChatMessage);
  wksp.value?.agent.events.addListener('chat', onAgentMessage);
});

onUnmounted(() => {
  wksp.value?.chat.events.removeListener('chat', onChatMessage);
  wksp.value?.agent.events.removeListener('chat', onAgentMessage);
});

// Setup again when the channel changes
watch(channelName, setup);

/** Set up the workspace and chat */
async function setup() {
  try {
    // Set up the workspace
    wksp.value = await Workspace.setupOrRedir(router);
    if (!wksp.value) return;

    // Update tab name
    document.title = utils.formTabName(wksp.value.metadata.label);

    // Check if this is an agent channel
    const agentChannels = await wksp.value.agent.getChannels();
    const agentChannel = agentChannels.find(chan => chan.name === channelName.value);
    
    if (agentChannel) {
      // This is an agent channel
      isAgentChannel.value = true;
      currentAgentChannel.value = agentChannel;
      items.value = await wksp.value.agent.getMessages(channelName.value);
    } else {
      // This is a regular chat channel
      isAgentChannel.value = false;
      currentAgentChannel.value = null;
      items.value = await wksp.value.chat.getMessages(channelName.value);
    }
  } catch (e) {
    console.error(e);
    Toast.error(`Failed to load channel: ${e}`);
    return;
  }

  // Scroll to the end of the chat
  nextTick(() => scroller.value?.scrollToBottom());
  globalThis.setTimeout(() => scroller.value?.scrollToBottom(), 100); // why
  globalThis.setTimeout(() => scroller.value?.scrollToBottom(), 500); // uhh
}

/** Check if a message is from an agent */
function isAgentMessage(item: IChatMessage | AgentMessage): item is AgentMessage {
  return 'role' in item;
}

/** Skip the header if the user is the same and the message is within a minute */
function skipHeader(item: IChatMessage | AgentMessage, index: number) {
  if (index === 0) return false;
  const prev = items.value![index - 1];
  return prev.user === item.user && item.ts - prev.ts < 1000 * 60;
}

/** Format the time of a chat message */
function formatTime(item: IChatMessage | AgentMessage) {
  if ('tsStr' in item && item.tsStr) return item.tsStr;
  if (!item.ts) return 'Unknown Time';

  const formatter = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
  const formatted = formatter.format(new Date(item.ts));
  if ('tsStr' in item) {
    item.tsStr = formatted;
  }
  return formatted;
}

/** Send a message to the workspace */
async function send(event: Event) {
  if (event instanceof KeyboardEvent) {
    if (event.shiftKey) return;
    event.preventDefault();
  }
  if (!outMessage.value.trim()) return;

  if (isAgentChannel.value) {
    // Send message to agent channel
    const agentMessage = {
      user: wksp.value!.username,
      message: outMessage.value,
      role: 'user' as const,
    };
    await wksp.value?.agent.sendMessage(channelName.value, agentMessage);
  } else {
    // Send message to regular chat channel
    const message = {
      uuid: String(), // auto
      user: wksp.value!.username,
      ts: Date.now(),
      message: outMessage.value,
    };
    await wksp.value?.chat.sendMessage(channelName.value, message);
  }

  // Reset the input
  outMessage.value = String();
  chatbox.value?.focus();
}

/** Trigger for receiving a chat message */
function onChatMessage(channel: string, message: IChatMessage) {
  if (channel !== channelName.value || isAgentChannel.value) return; // not for us or wrong channel type

  // Add the message to the chat
  items.value!.push(message);

  // Scroll to the bottom of the chat if the user is within 200px of the bottom
  const wrapper = scroller.value.$el;
  if (wrapper.scrollTop + wrapper.clientHeight + 200 >= wrapper.scrollHeight) {
    scroller.value.scrollToBottom();
  } else if (message.user !== wksp.value!.username) {
    unreadCount.value++;
  }
}

/** Trigger for receiving an agent message */
function onAgentMessage(channel: string, message: AgentMessage) {
  if (channel !== channelName.value || !isAgentChannel.value) return; // not for us or wrong channel type

  // Add the message to the chat
  items.value!.push(message);

  // Scroll to the bottom of the chat if the user is within 200px of the bottom
  const wrapper = scroller.value.$el;
  if (wrapper.scrollTop + wrapper.clientHeight + 200 >= wrapper.scrollHeight) {
    scroller.value.scrollToBottom();
  } else if (message.user !== wksp.value!.username) {
    unreadCount.value++;
  }
}
</script>

<style scoped lang="scss">
.outer {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;

  .scroller {
    flex: 1;
    overflow-y: auto;

    :deep(.vue-recycle-scroller__item-wrapper) {
      will-change: scroll-position;
    }

    :deep(.vue-recycle-scroller__item-view) {
      will-change: transform;
    }
  }

  .textarea {
    resize: none;
    font-size: 0.9rem;
  }

  div.chatbox {
    position: relative;

    button.send {
      position: absolute;
      bottom: 6px;
      right: calc(16px + 6px);
      width: 32px;
      opacity: 0.5;
      &:hover {
        opacity: 1;
      }
    }
  }
}

.chat-message {
  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }

  .holder {
    display: flex;
    flex-direction: row;

    .avatar {
      min-width: 36px;
      max-height: 36px;
      object-fit: cover;
      border-radius: 5px;
      overflow: hidden;
      margin-right: 10px;
      transform: translateY(4px); // visual hack

      > img {
        width: 36px;
        height: 36px;
      }
    }

    .message {
      flex: 1;
      display: flex;
      flex-direction: column;
      font-size: 14px;
      line-height: 1.5;

      .name {
        font-weight: bold;
      }

      .time {
        font-size: 12px;
        margin-left: 7px;
        color: var(--bulma-text-weak);
      }

      .content {
        white-space: normal;
        
        &.agent-message {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-left: 3px solid #3273dc;
          padding: 0.75rem;
          border-radius: 6px;
          margin-top: 0.25rem;
          
          :deep(p) {
            margin-bottom: 0.5rem;
            &:last-child {
              margin-bottom: 0;
            }
          }
        }
      }

      .name {
        &.is-agent {
          color: #3273dc;
          font-weight: 600;
        }
      }
    }
  }
}

.tag.new-unread {
  cursor: pointer;
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
}
</style>
