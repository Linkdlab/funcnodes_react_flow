import { create_json_safe } from "@/zustand-helpers";
import { IOStore, NodeStore, NodeType } from "../interfaces";
import {
  PartialSerializedNodeType,
  SerializedNodeType,
} from "../serializations";
import { normalize_node } from "./normalization";
import { assert_full_node } from "./full_node";
import { update_node } from "./update";
import { createIOStore } from "./iostore";
import { useShallow } from "zustand/react/shallow";

export const createNodeStore = (node: SerializedNodeType): NodeStore => {
  // check if node is Object
  const _nodestore: Omit<NodeStore, "node_state"> = {
    use: <U>(selector?: (state: NodeType) => U): U | NodeType => {
      return selector ? nodestore.node_state(selector) : nodestore.node_state();
    },
    useShallow: <U>(selector: (state: NodeType) => U): U => {
      return nodestore.node_state(useShallow(selector));
    },
    io_stores: new Map<string, IOStore>(),
    getState: () => {
      return nodestore.node_state.getState();
    },
    setState: (new_state: Partial<NodeType>) => {
      nodestore.node_state.setState(new_state);
    },
    update: (new_state: PartialSerializedNodeType) => {
      update_node(nodestore, new_state);
    },
    serialize: () => {
      const state = nodestore.node_state.getState();
      const serialized_node: SerializedNodeType = {
        ...state,
        io: Object.fromEntries(
          Array.from(nodestore.io_stores.entries()).map(([key, value]) => [
            key,
            value.serialize(),
          ])
        ),
      };
      return serialized_node;
    },
  };
  const normalized_node = normalize_node(node);
  const nodestore: NodeStore = {
    ..._nodestore,
    node_state: create_json_safe<NodeType>((_set, _get) => {
      return assert_full_node(normalized_node);
    }),
  };
  const normalized_io = normalized_node.io;
  Object.entries(normalized_io).forEach(([name, value]) => {
    if (value === undefined) return;
    nodestore.io_stores.set(name, createIOStore(normalized_node.id!, value));
  });

  return nodestore;
};
