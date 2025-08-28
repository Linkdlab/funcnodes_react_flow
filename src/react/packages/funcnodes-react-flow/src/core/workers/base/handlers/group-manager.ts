import { AbstractWorkerHandler } from "./worker-handlers.types";
import { NodeGroups } from "@/groups";
import { GroupActionUpdate } from "@/funcnodes-context";

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

  async group_nodes(nodeIds: string[], group_ids: string[]) {
    // This sends a command to the backend Python worker
    // The backend should implement a handler for the "group_nodes" command
    const res = (await this.communicationManager._send_cmd({
      cmd: "group_nodes",
      kwargs: { node_ids: nodeIds, group_ids: group_ids },
      wait_for_response: true,
    })) as NodeGroups;
    this.eventManager._receive_groups(res);
    return res;
  }

  async remove_group(gid: string) {
    await this.communicationManager._send_cmd({
      cmd: "remove_group",
      kwargs: { gid: gid },
      wait_for_response: true,
    });
    await this.syncManager.sync_nodespace();
  }

  locally_update_group(action: GroupActionUpdate) {
    this.syncManager.locally_update_group(action);
  }
}
