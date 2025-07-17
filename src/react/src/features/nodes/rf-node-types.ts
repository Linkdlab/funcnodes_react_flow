import { NodeGroup } from "@/groups";
import { Node as RFNode } from "@xyflow/react";

interface FuncNodesRFNodeData {
  groupID?: string;
  [key: string]: unknown;
}
interface FuncNodesRFNode extends RFNode {
  data: FuncNodesRFNodeData;
}

export interface GroupRFNodeData extends FuncNodesRFNodeData {
  group: NodeGroup;
  id: string;
}

export interface GroupRFNode extends FuncNodesRFNode {
  type: "group";
  data: GroupRFNodeData;
}

export interface DefaultRFNodeData extends FuncNodesRFNodeData {}

export interface DefaultRFNode extends FuncNodesRFNode {
  type: "default";
  data: DefaultRFNodeData;
}

export type AnyFuncNodesRFNode = GroupRFNode | DefaultRFNode;
