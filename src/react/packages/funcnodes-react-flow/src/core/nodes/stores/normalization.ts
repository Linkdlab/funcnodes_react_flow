import { LimitedDeepPartial } from "@/object-helpers";
import { PartialSerializedNodeType, SerializedIOType } from "../serializations";

export interface NormalizedPartialSerializedNodeType
  extends Omit<PartialSerializedNodeType, "io"> {
  io_order: string[];
  io: { [key: string]: LimitedDeepPartial<SerializedIOType> };
}

type WithRequiredId<T> = Omit<LimitedDeepPartial<T>, "id"> & { id: string };

function hasId<T>(io: unknown): io is WithRequiredId<T> {
  return (
    io !== undefined &&
    io !== null &&
    typeof io === "object" &&
    "id" in io &&
    typeof io.id === "string"
  );
}

export const normalize_node = (
  node: PartialSerializedNodeType
): NormalizedPartialSerializedNodeType => {
  let node_ios = node.io ?? {};
  let io_order = node.io_order as string[] | undefined;

  let new_io_order: string[] = [];
  const new_io: {
    [key: string]: LimitedDeepPartial<SerializedIOType>;
  } = {};

  if (io_order === undefined) {
    if (Array.isArray(node_ios)) {
      const node_ios_w_id = node_ios.filter(hasId);
      new_io_order = node_ios_w_id.map((io) => io.id);
      for (const io of node_ios_w_id) {
        new_io[io.id] = io;
      }
    } else {
      new_io_order = Object.keys(node_ios);
      for (const id in node_ios) {
        if (node_ios[id] !== undefined) {
          new_io[id] = node_ios[id];
        }
      }
    }
  } else {
    new_io_order = io_order;
    if (Array.isArray(node_ios)) {
      const node_ios_w_id = node_ios.filter(hasId);
      for (const io of node_ios_w_id) {
        new_io[io.id] = io;
        if (!new_io_order.includes(io.id)) {
          new_io_order.push(io.id);
        }
      }
    } else {
      for (const io in node_ios) {
        if (node_ios[io] !== undefined) {
          new_io[io] = node_ios[io];
        }
        if (!new_io_order.includes(io)) {
          new_io_order.push(io);
        }
      }
    }
  }

  // const new_io: SerializedNodeIOMappingType = {};
  // for (const io of io_order) {
  //   const psio: PartialSerializedIOType | undefined = node_ios[io];
  //   if (psio === undefined) continue;
  //   const [io_type, value, fullvalue] = assert_full_nodeio({
  //     ...psio,
  //     id: io,
  //   });
  //   new_io[io] = {
  //     ...io_type,
  //     value: value,
  //     fullvalue: fullvalue,
  //   };
  // }

  return { ...node, io_order: new_io_order, io: new_io };
};
