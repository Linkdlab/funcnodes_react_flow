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
  on_edge_change,
  on_connect,
}: {
  on_node_change?: (changes: NodeChange[]) => void;
  on_edge_change?: (changes: EdgeChange[]) => void;
  on_connect?: (connection: Connection) => void;
}): RFStore => {
  const _on_node_change = on_node_change || ((changes: NodeChange[]) => {});
  const _on_edge_change = on_edge_change || ((changes: EdgeChange[]) => {});
  const _on_connect = on_connect || ((connection: Connection) => {});
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
      _on_edge_change(changes);
    },
    onConnect: (connection: Connection) => {
      if (connection.source == null || connection.target == null) {
        return;
      }

      _on_connect(connection);
    },
  }));
  return useStore;
};

export default reactflowstore;
export type { RFState, RFStore };
