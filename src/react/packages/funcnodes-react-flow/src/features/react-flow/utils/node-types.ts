import { NodeTypes, EdgeTypes } from "@xyflow/react";
import { DefaultGroup } from "@/groups";
import { DefaultNode } from "@/nodes-components";
import { DefaultEdge } from "@/edges";
import { RFState } from "@/funcnodes-context";

export const nodeTypes: NodeTypes = {
  default: DefaultNode,
  group: DefaultGroup,
};

export const edgeTypes: EdgeTypes = {
  default: DefaultEdge,
};

export const selector = (state: RFState) => ({
  nodes: state.getNodes(),
  edges: state.getEdges(),
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});
