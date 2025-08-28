import { useWorkerApi } from "@/workers";

export const useGroupNodes = () => {
  const { group } = useWorkerApi();
  return async (nodeIds: string[], group_ids: string[]) => {
    if (!group) return;
    return await group.group_nodes(nodeIds, group_ids);
  };
};

export const useRemoveGroups = () => {
  const { group } = useWorkerApi();
  return async (group_ids: string[]) => {
    if (!group) return;
    for (const group_id of group_ids) {
      await group.remove_group(group_id);
    }
  };
};
