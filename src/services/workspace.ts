import { WorkspaceChat } from './workspace-chat';
import { WorkspaceProj, WorkspaceProjManager } from './workspace-proj';

import { SvsProvider } from '@/services/svs-provider';

import ndn from '@/services/ndn';
import { GlobalBus } from '@/services/event-bus';
import * as utils from '@/utils/index';

import type { WorkspaceAPI } from '@/services/ndn';
import type { Router } from 'vue-router';
import type { IWkspStats } from '@/services/types';

/**
 * We keep an active instance of the open workspace.
 * This always runs in the background collecting data.
 */
declare global {
  // eslint-disable-next-line no-var
  var ActiveWorkspace: Workspace | null;
}

/**
 * Workspace service
 */
export class Workspace {
  private constructor(
    public readonly metadata: IWkspStats,
    private readonly api: WorkspaceAPI,
    private readonly provider: SvsProvider,
    public readonly chat: WorkspaceChat,
    public readonly proj: WorkspaceProjManager,
  ) {}

  /**
   * Start the workspace.
   * This will connect to the testbed and start the SVS instance.
   */
  private static async create(metadata: IWkspStats): Promise<Workspace> {
    // Start connection to testbed
    await ndn.api.connect_testbed();

    // Set up client and ALO
    const api = await ndn.api.get_workspace(metadata.name);
    await api.start();

    // Create general SVS group
    const provider = await SvsProvider.create(api, 'root');

    // Create general modules
    const chat = await WorkspaceChat.create(api, provider);
    const proj = await WorkspaceProjManager.create(api, provider);

    // Create workspace object
    return new Workspace(metadata, api, provider, chat, proj);
  }

  /**
   * Destroy the workspace.
   * This will stop the SVS instance and disconnect from the testbed.
   */
  public async destroy() {
    await this.proj.destroy();
    await this.chat.destroy();
    await this.provider?.destroy();
    await this.api?.stop();
  }

  /**
   * Username is the NDN name of the user.
   * This is not necessarily the display name.
   */
  get username(): string {
    return this.api.name;
  }

  /**
   * Setup workspace from URL parameter.
   * @param space Workspace name from URL
   * @returns Workspace object or null if not found
   */
  public static async setup(space: string): Promise<Workspace> {
    if (!space) {
      throw new Error('No workspace name provided');
    }

    // Unescape URL name
    space = utils.unescapeUrlName(space);

    // Get workspace configuration from storage
    const metadata = await _o.stats.get(space);
    if (!metadata) {
      throw new Error(`Workspace not found, have you joined it? <br/> [${space}]`);
    }

    // Store last access time
    metadata.lastAccess = Date.now();
    _o.stats.put(space, metadata); // background

    // Start workspace if not already active
    if (globalThis.ActiveWorkspace?.metadata.name !== metadata.name) {
      try {
        await globalThis.ActiveWorkspace?.destroy();
      } catch (e) {
        console.error(e);
        GlobalBus.emit('wksp-error', new Error(`Failed to stop workspace: ${e}`));
      }
      globalThis.ActiveWorkspace = await Workspace.create(metadata);
    }

    return globalThis.ActiveWorkspace;
  }

  /**
   * Setup workspace from URL parameter or redirect to home.
   *
   * @param router Vue router
   */
  public static async setupOrRedir(router: Router): Promise<Workspace | null> {
    try {
      return await Workspace.setup(router.currentRoute.value.params.space as string);
    } catch (e) {
      console.error(e);
      GlobalBus.emit('wksp-error', new Error(`Failed to start workspace: ${e}`));
      router.push('/');
      return null;
    }
  }

  /**
   * Utility to setupOrRedir and get the active project.
   *
   * @param router Vue router
   */
  public static async setupAndGetActiveProj(router: Router): Promise<WorkspaceProj> {
    const wksp = await Workspace.setupOrRedir(router);
    if (!wksp) throw new Error('Workspace not found');

    if (wksp.proj.active) return wksp.proj.active;

    // No active project, try to get it from the URL
    const projName = router.currentRoute.value.params.project as string;
    if (!projName) throw new Error('No project name provided');

    const proj = await wksp.proj.get(projName);
    await proj.activate();
    return proj;
  }
}
