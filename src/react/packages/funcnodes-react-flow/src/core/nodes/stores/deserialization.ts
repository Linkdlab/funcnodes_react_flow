import { IOType, NodeType } from "../interfaces";
import {
  IOValueType,
  SerializedIOType,
  NormalizedSerializedNodeType,
} from "../serializations";

export const deserialize_node = (
  node: NormalizedSerializedNodeType
): NodeType => {
  const io_order = node.io_order;
  if (io_order === undefined) {
    throw new Error("Node must have io_order");
  }

  const new_node: NodeType = {
    ...node,
    inputs: Object.keys(node.io).filter((key) => node.io[key]!.is_input),
    outputs: Object.keys(node.io).filter((key) => !node.io[key]!.is_input),
    io_order,
  };
  return new_node;
};

export const deserialize_io = (
  io: SerializedIOType
): [IOType, IOValueType, IOValueType] => {
  if (io.value === "<NoValue>") {
    io.value = undefined;
  }
  if (io.fullvalue === "<NoValue>") {
    io.fullvalue = undefined;
  }

  if (io.hidden === undefined) {
    io.hidden = false;
  }

  const new_io: IOType = {
    ...io,
  };
  return [new_io, io.value, io.fullvalue];
};
