import { FuncNodesReactFlowZustandInterface } from "../states/fnrfzst.t";

export async function groupNodes(nodeIds: string[], group_ids: string[], fnrf_zst:FuncNodesReactFlowZustandInterface) {
  if (!fnrf_zst.worker) return;
  // Call backend/worker to group nodes
  const result = await fnrf_zst.worker.group_nodes(nodeIds, group_ids);
  // result should contain all node groups
  return result;
}

export async function removeGroup(group_ids: string[], fnrf_zst:FuncNodesReactFlowZustandInterface) {
  if (!fnrf_zst.worker) return;
  // Call backend/worker to remove group
  for (const group_id of group_ids) {
    await fnrf_zst.worker.remove_group(group_id);
  }
}

