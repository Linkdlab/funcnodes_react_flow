import { UseBoundStore, StoreApi } from "zustand";
import {
  Edge,
  Node,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
} from "@xyflow/react";

type RFState = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
};

// this is our useStore hook that we can use in our components to get parts of the store and call actions
type RFStore = UseBoundStore<StoreApi<RFState>>;

export type { RFState, RFStore };
