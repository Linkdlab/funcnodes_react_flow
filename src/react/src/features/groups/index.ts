export interface NodeGroup {
  node_ids: string[];
  child_groups: string[];
  parent_group: string | null;
  meta: Record<string, any>;
  position: [number, number];
}

export interface NodeGroups {
  [key: string]: NodeGroup;
}
