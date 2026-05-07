import { AbstractWorkerHandler } from "./worker-handlers.types";
import type { NodeGroups } from "@/groups";
import type { GroupActionUpdate } from "@/funcnodes-context";

export interface WorkerGroupManagerAPI {
  group_nodes: (nodeIds: string[], group_ids: string[]) => Promise<NodeGroups>;
  /** Create an executable GroupNode from selected backend nodes. */
  group_nodes_as_node: (
    nodeIds: string[],
    options?: ExecutableGroupOptions
  ) => Promise<string | undefined>;
  /** Ungroup one selected executable GroupNode. */
  ungroup_node: (groupNodeId: string) => Promise<void>;
  /** Convert one selected legacy visual group into an executable GroupNode. */
  materialize_group: (legacyGroupId: string) => Promise<string | undefined>;
  remove_group: (gid: string) => Promise<void>;
  locally_update_group: (action: GroupActionUpdate) => void;
}

export interface ExecutableGroupOptions {
  groupId?: string;
  name?: string;
}

type GroupCommandResult = string | { id?: string; uuid?: string } | undefined;

/** Extracts the new executable group id from worker command result variants. */
const getGroupResultId = (result: GroupCommandResult): string | undefined => {
  if (typeof result === "string") return result;
  return result?.id ?? result?.uuid;
};

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
   * Create an executable `GroupNode` in the active nodespace path.
   *
   * The worker remains authoritative for graph mutation; this wrapper only
   * delegates the command, resyncs the active snapshot, and returns the created
   * group id when the backend provides it.
   */
  async group_nodes_as_node(
    nodeIds: string[],
    options: ExecutableGroupOptions = {}
  ): Promise<string | undefined> {
    const kwargs: Record<string, unknown> = {
      path: this.activeNodeSpacePath,
      node_ids: nodeIds,
    };
    if (options.groupId) kwargs.group_id = options.groupId;
    if (options.name) kwargs.name = options.name;

    const result = (await this.communicationManager._send_cmd({
      cmd: "group_nodes_as_node_at_path",
      kwargs,
      wait_for_response: true,
    })) as GroupCommandResult;
    await this.syncManager.sync_active_nodespace();
    return getGroupResultId(result);
  }

  /**
   * Expand an executable `GroupNode` back into its parent active nodespace.
   */
  async ungroup_node(groupNodeId: string): Promise<void> {
    await this.communicationManager._send_cmd({
      cmd: "ungroup_node_at_path",
      kwargs: {
        path: this.activeNodeSpacePath,
        group_node_id: groupNodeId,
      },
      wait_for_response: true,
    });
    await this.syncManager.sync_active_nodespace();
  }

  /**
   * Convert a legacy visual group to an executable `GroupNode` explicitly.
   */
  async materialize_group(
    legacyGroupId: string
  ): Promise<string | undefined> {
    const result = (await this.communicationManager._send_cmd({
      cmd: "materialize_group_at_path",
      kwargs: {
        path: this.activeNodeSpacePath,
        legacy_group_id: legacyGroupId,
      },
      wait_for_response: true,
    })) as GroupCommandResult;
    await this.syncManager.sync_active_nodespace();
    return getGroupResultId(result);
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
