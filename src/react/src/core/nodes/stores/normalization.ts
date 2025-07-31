import { IOType } from "../interfaces/io";
import {
  PartialSerializedIOType,
  PartialSerializedNodeIOMappingType,
  PartialSerializedNodeType,
  SerializedNodeIOMappingType,
} from "../serializations";
import { assert_full_nodeio } from "./full-io";

export interface NormalizedPartialSerializedNodeType
  extends PartialSerializedNodeType {
  io_order: string[];
  io: SerializedNodeIOMappingType;
}

export const normalize_node = (
  node: PartialSerializedNodeType
): NormalizedPartialSerializedNodeType => {
  let node_ios: PartialSerializedNodeIOMappingType = node.io ?? {};

  let io_order = node.io_order as string[] | undefined;
  if (io_order === undefined) {
    if (Array.isArray(node_ios)) {
      io_order = node_ios.map((io) => io.id);
      const new_io: { [key: string]: IOType | undefined } = {};
      for (const io of node_ios) {
        new_io[io.id] = io;
      }
      node_ios = new_io;
    } else {
      io_order = Object.keys(node_ios);
    }
  } else {
    if (Array.isArray(node_ios)) {
      const new_io: { [key: string]: IOType | undefined } = {};
      for (const io of node_ios) {
        new_io[io.id] = io;
        if (!io_order.includes(io.id)) {
          io_order.push(io.id);
        }
      }
      node_ios = new_io;
    } else {
      for (const io in node_ios) {
        if (!io_order.includes(io)) {
          io_order.push(io);
        }
      }
    }
  }

  const new_io: SerializedNodeIOMappingType = {};
  for (const io of io_order) {
    const psio: PartialSerializedIOType | undefined = node_ios[io];
    if (psio === undefined) continue;
    const [io_type, value, fullvalue] = assert_full_nodeio({
      ...psio,
      id: io,
    });
    new_io[io] = {
      ...io_type,
      value: value,
      fullvalue: fullvalue,
    };
  }

  return { ...node, io_order, io: new_io };
};
