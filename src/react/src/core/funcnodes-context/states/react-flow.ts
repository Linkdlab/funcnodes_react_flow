import { UseBoundStore, StoreApi } from "zustand";
import {
  Edge,
  Node,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
} from "@xyflow/react";

type RFState = {
  _nodes: Node[];
  _edges: Edge[];
  _nodes_map: Map<string, Node>;
  update_nodes: (nodes: Node[]) => void;
  partial_update_nodes: (nodes: Node[]) => void;
  update_edges: (edges: Edge[]) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  getNode: (id: string) => Node | undefined;
  getNodes: () => Node[];
  getEdges: () => Edge[];
};

// this is our useStore hook that we can use in our components to get parts of the store and call actions
type RFStore = UseBoundStore<StoreApi<RFState>>;

export type { RFState, RFStore };
