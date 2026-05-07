import { AbstractWorkerHandler } from "./worker-handlers.types";
import type { NodeGroups } from "@/groups";
import type { GroupActionUpdate } from "@/funcnodes-context";

export interface WorkerGroupManagerAPI {
  group_nodes: (nodeIds: string[], group_ids: string[]) => Promise<NodeGroups>;
  remove_group: (gid: string) => Promise<void>;
  locally_update_group: (action: GroupActionUpdate) => void;
}

export class WorkerGroupManager
  extends AbstractWorkerHandler
  implements WorkerGroupManagerAPI
{
  public start(): void {
    // no-op
  }

  public stop(): void {
    // no-op
  }

  /**
   * Create a legacy visual group in the active root or executable group nodespace.
   */
  async group_nodes(nodeIds: string[], group_ids: string[]) {
    const res = (await this.communicationManager._send_cmd({
      cmd: "group_nodes_at_path",
      kwargs: {
        path: this.activeNodeSpacePath,
        node_ids: nodeIds,
        group_ids: group_ids,
      },
      wait_for_response: true,
    })) as NodeGroups;
    this.eventManager._receive_groups(res);
    return res;
  }

  /**
   * Remove a legacy visual group from the active nodespace.
   */
  async remove_group(gid: string) {
    await this.communicationManager._send_cmd({
      cmd: "remove_group_at_path",
      kwargs: { path: this.activeNodeSpacePath, gid: gid },
      wait_for_response: true,
    });
    await this.syncManager.sync_active_nodespace();
  }

  /**
   * Queue a local legacy visual group update for path-aware synchronization.
   */
  locally_update_group(action: GroupActionUpdate) {
    this.syncManager.locally_update_group(action);
  }
}
