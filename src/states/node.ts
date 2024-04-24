import { create } from "zustand";
import { deep_merge } from "../utils";
import { NodeType, PartialNodeType, NodeStore } from "./node.t";
import { IOType } from "./nodeio.t";
const dummy_node: NodeType = {
  id: "dummy",
  node_name: "dummy",
  frontend: {
    pos: [0, 0],
    size: [200, 100],
    collapsed: false,
  },
  io: {},
  name: "dummy",
  in_trigger: false,
  io_order: [],
};
const assert_full_node = (node: PartialNodeType): NodeType => {
  if (!node.id) {
    throw new Error("Node must have an id");
  }

  const { new_obj } = deep_merge(dummy_node, node);
  return new_obj;
};

const createNodeStore = (node: NodeType): NodeStore => {
  // check if node is Object

  if (node.io === undefined) {
    node.io = {};
  }
  if (Array.isArray(node.io)) {
    node.io_order = node.io.map((io) => io.id);
    const new_io: { [key: string]: IOType } = {};
    for (const io of node.io) {
      new_io[io.id] = io;
    }
    node.io = new_io;
  } else {
    node.io_order = Object.keys(node.io);
  }

  return create<NodeType>((_set, _get) => node);
};
export { createNodeStore, assert_full_node };
