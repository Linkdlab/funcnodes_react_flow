import { latest } from "../types/versioned/versions.t";

interface BaseGroupAction {
    type: string;
    id: string;
    group: Partial<latest.NodeGroup>
    from_remote: boolean;
    immediate?: boolean;
  }
  
//   interface GroupActionAdd extends BaseGroupAction {
//     type: "add";
//   }
  
//   interface GroupActionDelete extends BaseGroupAction {
//     type: "delete";
//   }

  interface GroupActionSet {
    type: "set";
    groups: latest.NodeGroups;
  }

  interface GroupActionUpdate extends BaseGroupAction {
    type: "update";
  }
  
  type GroupAction =  GroupActionSet | GroupActionUpdate;

export type {
  GroupAction,
  GroupActionSet,
  GroupActionUpdate,
};