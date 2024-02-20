import { create, UseBoundStore, StoreApi } from "zustand";
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";

type RFState = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
};

// this is our useStore hook that we can use in our components to get parts of the store and call actions
type RFStore = UseBoundStore<StoreApi<RFState>>;
const reactflowstore = ({
  on_node_change,
}: {
  on_node_change?: (changes: NodeChange[]) => void;
}): RFStore => {
  const _on_node_change = on_node_change || ((changes: NodeChange[]) => {});
  const useStore = create<RFState>((set, get) => ({
    nodes: [],
    edges: [],
    onNodesChange: (changes: NodeChange[]) => {
      set({
        nodes: applyNodeChanges(changes, get().nodes),
      });
      _on_node_change(changes);
    },
    onEdgesChange: (changes: EdgeChange[]) => {
      set({
        edges: applyEdgeChanges(changes, get().edges),
      });
    },
    onConnect: (connection: Connection) => {
      set({
        edges: addEdge(connection, get().edges),
      });
    },
  }));
  return useStore;
};

export default reactflowstore;
export type { RFState, RFStore };
