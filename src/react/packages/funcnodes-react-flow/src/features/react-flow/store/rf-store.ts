import { create } from "zustand";
import {
  Connection,
  EdgeChange,
  NodeChange,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
} from "@xyflow/react";
import { RFStore, RFState } from "@/funcnodes-context";
import { sortByParent } from "@/nodes-core";

export const reactflowstore = ({
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
    _nodes: [],
    _edges: [],
    _nodes_map: new Map(),
    update_nodes: (nodes: Node[]) => {
      nodes = sortByParent(nodes);
      set({
        _nodes: nodes,
        _nodes_map: new Map(nodes.map((node) => [node.id, node])),
      });
    },
    partial_update_nodes: (nodes: Node[]) => {
      const state = get();
      const old_nodes = state._nodes;
      const old_nodes_id_map = new Map(
        old_nodes.map((node) => [node.id, node])
      );
      for (const node of nodes) {
        old_nodes_id_map.set(node.id, node);
      }
      state.update_nodes(Array.from(old_nodes_id_map.values()));
    },
    update_edges: (edges: Edge[]) => {
      set({
        _edges: edges,
      });
    },
    onNodesChange: (changes: NodeChange[]) => {
      const state = get();
      state.update_nodes(applyNodeChanges(changes, state._nodes));
      _on_node_change(changes);
    },
    onEdgesChange: (changes: EdgeChange[]) => {
      set({
        _edges: applyEdgeChanges(changes, get()._edges),
      });
      _on_edge_change(changes);
    },
    onConnect: (connection: Connection) => {
      if (connection.source == null || connection.target == null) {
        return;
      }

      _on_connect(connection);
    },
    getNode: (id: string) => {
      return get()._nodes_map.get(id);
    },
    getNodes: () => {
      return get()._nodes;
    },
    getEdges: () => {
      return get()._edges;
    },
  }));
  return useStore;
};
