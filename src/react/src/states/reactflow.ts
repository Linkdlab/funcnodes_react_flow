import { create } from "zustand";
import {
  Connection,
  EdgeChange,
  NodeChange,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import { RFState, RFStore } from "./reactflow.t";

const reactflowstore = ({
  on_node_change,
  on_edge_change,
  on_connect,
}: {
  on_node_change?: (changes: NodeChange[]) => void;
  on_edge_change?: (changes: EdgeChange[]) => void;
  on_connect?: (connection: Connection) => void;
}): RFStore => {
  const _on_node_change = on_node_change || ((_changes: NodeChange[]) => {});
  const _on_edge_change = on_edge_change || ((_changes: EdgeChange[]) => {});
  const _on_connect = on_connect || ((_connection: Connection) => {});
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
