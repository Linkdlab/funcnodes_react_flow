import { NodeGroup, NodeGroups } from "@/groups";

interface BaseGroupAction {
  type: string;
  id: string;
  group: Partial<NodeGroup>;
  from_remote: boolean;
  immediate?: boolean;
}

interface GroupActionSet {
  type: "set";
  groups: NodeGroups;
}

interface GroupActionUpdate extends BaseGroupAction {
  type: "update";
}

type GroupAction = GroupActionSet | GroupActionUpdate;

export type { GroupAction, GroupActionSet, GroupActionUpdate };
