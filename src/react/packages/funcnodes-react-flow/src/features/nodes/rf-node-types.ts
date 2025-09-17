import { NodeGroup } from "@/groups";
import { Node as RFNode } from "@xyflow/react";

export interface CollapsedGroupIO {
  handleId: string;
  nodeId: string;
  ioId: string;
  ioName: string;
  nodeName: string;
  direction: "input" | "output";
  connectionCount: number;
  type?: string;
}

export interface CollapsedGroupVisualState {
  inputs: CollapsedGroupIO[];
  outputs: CollapsedGroupIO[];
}

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
  collapsed?: boolean;
  collapsedInfo?: CollapsedGroupVisualState;
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
