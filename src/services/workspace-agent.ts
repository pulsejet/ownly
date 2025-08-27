import { EventEmitter } from 'events';
import * as Y from 'yjs';
import { nanoid } from 'nanoid'

import { GlobalBus } from '@/services/event-bus';
import type { SvsProvider } from '@/services/svs-provider';
import type { WorkspaceAPI } from './ndn';
import type TypedEmitter from 'typed-emitter';

/**
 * AgentCard describes the metadata exposed by an A2A agent.
 * The shape of this interface matches the common fileds in the Agent-toAgent specificaiton.
 * Additional fields may be added when needed.
 */

export interface AgentCard {
  /** Human readable name for the agent */
  name: string;
  /** Short description of the agent */
  description: string;
  /** Base URL where the agent is hosted */
  url: string;
  /** Provider information for teh agent */
  provider?: {
    /** Owning organisation of the agent */
    organization?: string;
    /** Website for the organisaiton */
    url?: string;
  };
  /** A2A protocol version implemented by the agent */
  version?: string;
  /** Optional extra fields */
  [key: string]: unknown;

}

/**
 * A chat channel bound ot a specific agent. Each agent channel keeps track of the agent card so calls can be routed correctly.
 */
export interface AgentChannel {
  /** Unique identifier for the channel */
  uuid: string;
  /** Display name for the channel */
  name: string;
  /** Reference to the agent card by its URL (used as ID) */
  agentId: string;
}

/** Individual message exchanged in an agent channel. The rule field distinguishes between. messages sent by the suer and thos sent by the agent. */
export interface AgentMessage{
  /** Unique identifier of the message */
  uuid: string;
  /** Identifier of the sender (user name or agent name)*/
  user: string;
  /** timestamp when the message was sent (epoch milliseconds) */
  ts: number;
  /** Content of the message */
  message: string;
  /** The role of the sender ('user' for human, 'agent' for replies) */
  role: 'user' | 'agent';
}


/** WorkspaceAgent encapsulates discovery of agents, creation of dedicated channels and chat with those agents. It persists its state in a Yjs document backed by an SVS provider so taht channel lists and chat history are replicated to peers via NDN */
export class WorkspaceAgentManager{
  /** List of all available agent cards */
  private readonly agentCards: Y.Array<AgentCard>;
  /** List of all agents channels*/
  private readonly channels: Y.Array<AgentChannel>;
  /** Map of chat messages for each channel */
  private readonly messages: Y.Map<Y.Array<AgentMessage>>;
  /** Event emitter to notify listenrs about new messages or channel changes.
   * - 'chat' fires when a new message is added to any channel
   * - 'channelAdded' fires when a new agent channel is created.
   */
  public readonly events = new EventEmitter() as TypedEmitter<{
    chat: (channel: string, message: AgentMessage)=> void;
    channelAdded: (channel: AgentChannel) => void;
  }>;

  /** private constructor. instances should be created via the static {@link create} method which handles loading the underlying Yjs documents. */

  private constructor(
    private readonly api: WorkspaceAPI,
    private readonly doc: Y.Doc,
  ) {
    this.agentCards = doc.getArray<AgentCard>('_agent_cards_');
    this.channels = doc.getArray<AgentChannel>('_agent_chan_');
    this.messages = doc.getMap<Y.Array<AgentMessage>>('_agent_msg_');

    // Observe channel list changes and forward them onto the global bus.
    const emitChannels = () => {
      // Emit agent channels to a separate event
      GlobalBus.emit('agent-channels', this.channels.toArray());
    };
    this.channels.observe(emitChannels);
    //broadcast the current state of channels when the WorkspaceAgent is first created, ensuring the UI starts with the correct channel list.
    emitChannels();

    //Observe deep changes to teh message map and notify local listeners.
    this. messages.observeDeep((events)=> {
      if (this.events.listenerCount(('chat'))=== 0) return;
      for (const ev of events){
        if (ev.path.length > 0) {
          const channelUuid = String(ev.path[0]);

          // Find the channel name by UUID
          const channelData = this.channels.toArray().find(ch => ch.uuid === channelUuid);
          if (!channelData) {
            console.warn('Channel not found for UUID:', channelUuid);
            continue;
          }
          const channelName = channelData.name;

          // Use Set.forEach instead of for...of
          ev.changes.added.forEach(delta => {
            try {
              const content = delta.content.getContent();
              const messages = Array.isArray(content) ? content : [content];

              messages.forEach(msg => {
                if (msg) {
                  this.events.emit('chat', channelName, msg as AgentMessage);
                }
              });
            } catch (error) {
              console.warn('Error processing message delta:', error);
            }
          });
        }
      }
    });
  }
  /**
   * Create the agent service for a workspace. A Yjs doc name 'agent' will be loaded or vreated via the given provider.
   * @param api WorkspaceAPI instance associated with teh workspave
   * @param provider SVS provider used to persist and sync state
   */
  public static async create(api: WorkspaceAPI, provider: SvsProvider): Promise<WorkspaceAgentManager> {
      const doc = await provider.getDoc('agent');
      return new WorkspaceAgentManager(api,doc);
    }

  /**
   * Destroy the agent service and release its resources.
   */
  public async destroy() {
    this.doc.destroy();
  }

  /**
   * Get a snapshot of the current list of agent cards.
   */
  public getAgentCards(): AgentCard[] {
    return this.agentCards.toArray();
  }

  /**
   * Add or update an agent card in the shared collection.
   */
  public addOrUpdateAgentCard(agentCard: AgentCard): void {
    const existingIndex = this.agentCards.toArray().findIndex(card => card.url === agentCard.url);

    if (existingIndex >= 0) {
      // Update existing card
      this.agentCards.delete(existingIndex, 1);
      this.agentCards.insert(existingIndex, [agentCard]);
    } else {
      // Add new card
      this.agentCards.push([agentCard]);
    }
  }

  /**
   * Get an agent card by its URL (used as ID).
   */
  public getAgentCard(agentId: string): AgentCard | undefined {
    return this.agentCards.toArray().find(card => card.url === agentId);
  }

  /**
   * Remove an agent card from the shared collection by URL.
   */
  public removeAgentCard(agentUrl: string): boolean {
    const existingIndex = this.agentCards.toArray().findIndex(card => card.url === agentUrl);

    if (existingIndex >= 0) {
      this.agentCards.delete(existingIndex, 1);
      return true;
    }
    return false;
  }

  /**
   * Get a snapshot of the current list of agent channels with resolved agent cards.
   */
  public async getChannels(): Promise<(AgentChannel & { agent: AgentCard })[]> {
    return this.channels.toArray().map(channel => {
      const agent = this.getAgentCard(channel.agentId);
      if (!agent) {
        throw new Error(`Agent card not found for channel ${channel.name}: ${channel.agentId}`);
      }
      return { ...channel, agent };
    });
  }

  /**
   * Discover an agent card from a base URL. The default lookup path is './well-known/agent.json' as per the A2A specification. On success, retrieved JSON will be returned as an {@link AgentCard}.
   * If the request fails an exception will be thrown.
   * @param baseUrl Base URL of the agent server (without trailing slash)
   * @returns Promise resolving to the discovered {@link AgentCard}
   */
  public async discoverAgent(baseUrl: string): Promise<AgentCard> {
    const trimmed = baseUrl.replace(/\/+$/,'');

    try {
      const res = await fetch(`${trimmed}/.well-known/agent.json`, {
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      // The fetched JSON may include unknown properties; we can cast to AgentCard
      const card = (await res.json()) as AgentCard;

      // Attach the base URL if missing
      if (!card.url) {
        card.url = trimmed;
      }

      return card;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error(
          `CORS Error: Cannot connect to ${baseUrl}. ` +
          `The agent server needs to allow cross-origin requests from your domain. ` +
          `Please add CORS headers or use a CORS proxy.`
        );
      }
      throw new Error(`Failed to discover agent at ${baseUrl}: ${error}`);
    }
  }

  /**
   * Create a new agent channel and initialize its message history.
   * if a channel with same dispaly name already exists, throw an exception
   * An initial system message iwll be added to the history indicating the agent has been added.
   *
   * @param agent The agent card obtained via {@link discoverAgent}
   * @param name Optional custom channel name. degaults to agent.name
   * */

  public async addAgentChannel(agent: AgentCard, name?: string): Promise<AgentChannel & { agent: AgentCard }>{
    const chanName = name ?? agent.name;
    const existing = this.channels.toArray().find((ch) => ch.name === chanName);
    if (existing) throw new Error('Channel already exists');

    // Add/update the agent card in the shared collection
    this.addOrUpdateAgentCard(agent);

    const channel: AgentChannel = {
      uuid: nanoid(),
      name: chanName,
      agentId: agent.url, // Use URL as agent ID
    };

    this.channels.push([channel]);
    this.messages.set(channel.uuid, new Y.Array<AgentMessage>());

    const channelWithAgent = { ...channel, agent };
    this.events.emit('channelAdded', channelWithAgent);

    // Add a system message announcing the new channel
    const sysMsg: AgentMessage = {
      uuid: nanoid(),
      user: 'ownly-bot',
      ts: Date.now(),
      message: `#${chanName} agent channel was created by ${this.api.name}`,
      role: 'agent',
    };
    (await this.getMsgArray(channel.uuid)).push([sysMsg]);
    return channelWithAgent;
  }

  /**
   * Retrieve the message array for a given channel UUID or throw if it does not exist.
   * */
  private async getMsgArray(channelUuid: string): Promise<Y.Array<AgentMessage>> {
    const arr = this.messages.get(channelUuid);
    if (!arr) throw new Error('Channel does not exist');
    return arr;
  }

  /** Get a snapshot of the message history for a channel */
  public async getMessages(channelName: string): Promise<AgentMessage[]>{
    const channel = this.channels.toArray().find(c => c.name === channelName);
    if (!channel) throw new Error('Channel not found');

    // Try to get messages by UUID first (new system)
    let arr = this.messages.get(channel.uuid);

    // If no messages found by UUID, try the old channel name system (for backward compatibility)
    if (!arr || arr.length === 0) {
      const oldArr = this.messages.get(channelName);
      if (oldArr && oldArr.length > 0) {
        // Migrate old messages to new UUID-based system
        const messages = oldArr.toArray();
        const newArr = new Y.Array<AgentMessage>();
        newArr.insert(0, messages);
        this.messages.set(channel.uuid, newArr);

        // Remove old messages (optional, for cleanup)
        this.messages.delete(channelName);

        arr = newArr;
      }
    }

    if (!arr) {
      // Create empty array if no messages exist
      arr = new Y.Array<AgentMessage>();
      this.messages.set(channel.uuid, arr);
    }

    return arr.toArray();
  }

  /**
   * Delete an agent channel and all its messages.
   * @param channelName Name of the channel to delete
   */
  public async deleteAgentChannel(channelName: string): Promise<void> {
    const channelIndex = this.channels.toArray().findIndex((ch) => ch.name === channelName);
    if (channelIndex === -1) {
      throw new Error('Channel not found');
    }

    const channel = this.channels.toArray()[channelIndex];

    // Perform all deletions in a single Y.js transaction for atomicity
    this.doc.transact(() => {
      // Remove the channel from the list
      this.channels.delete(channelIndex);

      // Remove the message history using UUID
      this.messages.delete(channel.uuid);
    });

    console.log(`Deleted agent channel: ${channelName}`);
  }

  /**
   * Send a message to a channel.
   * if the message role is user it will be forwarded to the underlying agent via {@link invokeAgent}
   * Reply will be appended to the same channel once received.
   * @param channel Name of the channel ot send to
   * @param message The message to send. 'uuid' and 'ts' will be auto set.
   */
  public async sendMessage(channelName: string, message: Omit<AgentMessage, 'uuid' | 'ts'> & { ts?: number }): Promise<void> {
    // Find the channel by name
    const chan = this.channels.toArray().find((c) => c.name === channelName);
    if (!chan) throw new Error('Channel not found');

    // build the message object with auto-generated uuid and timestamp
    const msg: AgentMessage = {
      uuid: nanoid(),
      ts: message.ts ?? Date.now(),
      user: message.user,
      message: message.message,
      role: message.role,
    };
    (await this.getMsgArray(chan.uuid)).push([msg]);
    //If this is a user message, forward it to the agent asynchronously
    if (msg.role === 'user'){
      const agentCard = this.getAgentCard(chan.agentId);
      if (agentCard) {
        this.invokeAgent(agentCard, msg, chan.uuid).catch((e) => {
          console.error('Agent invocation failed', e);
        });
      }
    }

  }

  /**
   * Internal helper to perform an A2A invocation against the given agent.
   * This method uses a simple HTTP POST to an '/invoke' endpoint;
   * if the agent implements a differnet contract adjust this accordingly.
   * replies will be recorded int the cahnnel as Agent messages
   *
   * @param agent The agent card used to determine the endpoint
   * @ param userMsg The user message that triggered the invocation
   * @param channel Name of the channel where the reply should be stored
   */
  private async invokeAgent(agent: AgentCard, userMsg: AgentMessage, channel: string): Promise<void>{
    // Check if agent uses JSON-RPC protocol
    // requries auto-detection update later
    const useJsonRpc = agent.preferredTransport === 'JSONRPC' ||
                       (agent as any).preferredTransport === 'JSONRPC' ||
                       agent.protocolVersion === '0.3.0' ||  // Our agent card at llama server currently has this
                       (agent as any).protocolVersion === '0.3.0';

    console.log('Agent card properties:', Object.keys(agent));
    console.log('preferredTransport:', agent.preferredTransport || (agent as any).preferredTransport);
    console.log('protocolVersion:', agent.protocolVersion || (agent as any).protocolVersion);
    console.log('Will use JSON-RPC:', useJsonRpc);

    let payload: any;
    let endpoint: string;

    if (useJsonRpc) {
      // Use JSON-RPC 2.0 format
      payload = {
        jsonrpc: "2.0",
        id: userMsg.uuid,
        method: "message/send",
        params: {
          message: {
            role: "user",
            messageId: userMsg.uuid,
            parts: [
              { text: userMsg.message }
            ]
          }
        }
      };
      endpoint = agent.url.replace(/\/+$/, ''); // Use base URL for JSON-RPC
    } else {
      // Use A2A REST format
      payload = {
        input: { text: userMsg.message },
      };
      endpoint = `${agent.url.replace(/\/+$/, '')}/invoke`;
    }

    let responseText: string | undefined;

    try {
      console.log(`Invoking agent at: ${endpoint}`);
      console.log('Protocol:', useJsonRpc ? 'JSON-RPC' : 'REST');
      console.log('Payload:', payload);

      const res = await fetch(endpoint, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', res.status);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }

      // Parse response based on protocol
      const data = await res.json();
      console.log('Response data:', data);

      if (useJsonRpc) {
        // Handle JSON-RPC response
        if (data.error) {
          throw new Error(`JSON-RPC Error: ${data.error.message || JSON.stringify(data.error)}`);
        }

        const result = data.result;
        if (typeof result === 'string') {
          responseText = result;
        } else if (result && typeof result.content === 'string') {
          responseText = result.content;
        } else if (result && typeof result.text === 'string') {
          responseText = result.text;
        } else if (result && typeof result.message === 'string') {
          responseText = result.message;
        } else if (result && result.parts && Array.isArray(result.parts) && result.parts[0]?.text) {
          responseText = result.parts[0].text;
        } else {
          responseText = JSON.stringify(result || data);
        }
      } else {
        // Handle REST/A2A response
        if (typeof data === 'string') {
          responseText = data;
        } else if (typeof (data as any).content === 'string') {
          responseText = (data as any).content;
        } else if (typeof (data as any).text === 'string') {
          responseText = (data as any).text;
        } else if (typeof (data as any).message === 'string') {
          responseText = (data as any).message;
        } else if (typeof (data as any).response === 'string') {
          responseText = (data as any).response;
        } else {
          responseText = JSON.stringify(data);
        }
      }

    } catch (e) {
      console.error('Agent invocation error:', e);

      if (e instanceof TypeError && e.message.includes('Failed to fetch') ) {
        responseText = `CORS Error: Cannot connect to agent at ${agent.url}. The agent server needs to allow cross-origin requests from your domain. Please contact the agent provider to add CORS headers.`;
      } else if (e instanceof Error) {
        responseText = `Error from agent: ${e.message}`;
      } else {
        responseText = `Unknown error: ${e}`;
      }
    }
    // Append the agent's reply to the channel
    const reply: AgentMessage = {
      uuid: nanoid(),
      user: agent.name,
      ts: Date.now(),
      message: responseText ??  '',
      role: 'agent',
    };
    (await this.getMsgArray(channel)).push([reply]);
  }

}


