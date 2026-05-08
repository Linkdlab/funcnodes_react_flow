import { useWorkerApi } from "../../../core/workers/hooks";
import { useFuncNodesContext } from "@/providers";

/**
 * Create a legacy visual group for selected nodes and visual groups.
 *
 * This remains available for UI-only grouping metadata and intentionally does
 * not create executable `GroupNode` instances.
 */
export const useGroupNodes = () => {
  const { group } = useWorkerApi();
  return async (nodeIds: string[], group_ids: string[]) => {
    if (!group) return;
    return await group.group_nodes(nodeIds, group_ids);
  };
};

/**
 * Create an executable `GroupNode` from selected backend nodes and select it
 * after the worker resyncs the active nodespace snapshot.
 */
export const useGroupNodesAsNode = () => {
  const fnrf_zst = useFuncNodesContext();
  const { group } = useWorkerApi();
  return async (nodeIds: string[]) => {
    if (!group || nodeIds.length === 0) return undefined;
    const newGroupId = await group.group_nodes_as_node(nodeIds);
    if (!newGroupId) return undefined;

    const rfstate = fnrf_zst.useReactFlowStore.getState();
    const nodes = rfstate.getNodes();
    if (!nodes.some((node) => node.id === newGroupId)) return newGroupId;
    rfstate.update_nodes(
      nodes.map((node) => ({
        ...node,
        selected: node.id === newGroupId,
      }))
    );
    return newGroupId;
  };
};

/** Ungroup one or more selected executable `GroupNode` instances. */
export const useUngroupNodes = () => {
  const { group } = useWorkerApi();
  return async (groupNodeIds: string[]) => {
    if (!group) return;
    for (const groupNodeId of groupNodeIds) {
      await group.ungroup_node(groupNodeId);
    }
  };
};

/** Convert selected legacy visual groups to executable `GroupNode` instances. */
export const useMaterializeGroups = () => {
  const { group } = useWorkerApi();
  return async (legacyGroupIds: string[]) => {
    if (!group) return [];
    const createdGroupIds: string[] = [];
    for (const legacyGroupId of legacyGroupIds) {
      const createdGroupId = await group.materialize_group(legacyGroupId);
      if (createdGroupId) createdGroupIds.push(createdGroupId);
    }
    return createdGroupIds;
  };
};

/** Remove legacy visual groups from the active nodespace. */
export const useRemoveGroups = () => {
  const { group } = useWorkerApi();
  return async (group_ids: string[]) => {
    if (!group) return;
    for (const group_id of group_ids) {
      await group.remove_group(group_id);
    }
  };
};
