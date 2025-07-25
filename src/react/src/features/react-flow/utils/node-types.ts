import { NodeTypes, EdgeTypes } from "@xyflow/react";
import { RFState, DefaultGroup } from "@/barrel_imports";
import { DefaultNode } from "@/nodes";
import { DefaultEdge } from "@/edges";

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
