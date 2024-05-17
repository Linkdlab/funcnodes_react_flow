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

  for (const ioid in new_obj.io) {
    const io = new_obj.io[ioid];
    if (io === undefined) continue;
    if (io.render_options === undefined) {
      io.render_options = {
        set_default: false,
        type: io.type,
      };
    }
    if (io.render_options.set_default === undefined) {
      io.render_options.set_default = false;
    }

    if (io.render_options.type === undefined) {
      io.render_options.type = io.type;
    }
  }
  return new_obj;
};

const normalize_node = (node: PartialNodeType): PartialNodeType => {
  if (node.io === undefined) {
    node.io = {};
  }
  if (node.io_order === undefined) {
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
  } else {
    if (Array.isArray(node.io)) {
      const new_io: { [key: string]: IOType } = {};
      for (const io of node.io) {
        new_io[io.id] = io;
        if (!node.io_order.includes(io.id)) {
          node.io_order.push(io.id);
        }
      }
      node.io = new_io;
    } else {
      for (const io in node.io) {
        if (!node.io_order.includes(io)) {
          node.io_order.push(io);
        }
      }
    }
  }
  return node;
};

const createNodeStore = (node: NodeType): NodeStore => {
  // check if node is Object

  return create<NodeType>((_set, _get) =>
    assert_full_node(normalize_node(node))
  );
};
export { createNodeStore, assert_full_node, normalize_node };
