import { create } from "zustand";
import { deep_update } from "../utils";
import { NodeType, PartialNodeType, NodeStore } from "./node.t";
import { IOType } from "./nodeio.t";

const dummy_nodeio: IOType = {
  id: "dummy",
  name: "dummy",
  node: "dummy",
  full_id: "dummy",
  type: "any",
  value: undefined,
  is_input: false,
  connected: false,
  does_trigger: true,
  fullvalue: undefined,
  try_get_full_value: undefined,
  render_options: {
    set_default: true,
    type: "any",
  },
  set_hidden: undefined,
  hidden: false,
};
const assert_full_nodeio = (io: Partial<IOType>): IOType => {
  if (!io.id) {
    throw new Error(
      "IO must have an id but is missing for " + JSON.stringify(io)
    );
  }

  if (io.name === undefined) {
    io.name = io.id;
  }

  const { new_obj } = deep_update(io, dummy_nodeio);

  if (
    new_obj.render_options.type === "any" ||
    new_obj.render_options.type === undefined
  )
    new_obj.render_options.type = new_obj.type;

  return new_obj;
};

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

  const { new_obj } = deep_update(node, dummy_node);

  for (const ioid in new_obj.io) {
    if (new_obj.io[ioid] === undefined) continue;
    const io = assert_full_nodeio(new_obj.io[ioid]);
    new_obj.io[ioid] = io;
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