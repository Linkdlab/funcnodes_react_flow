import { latest } from "../../types/versioned/versions.t";

const simple_updater = <
  U extends string | number | boolean,
  T extends U | undefined
>(
  oldvalue: U,
  newvalue: T
): [U, boolean] => {
  return newvalue === undefined
    ? [oldvalue, false]
    : [newvalue, oldvalue !== newvalue];
};

function assertNever(x: never, y: any): never {
  throw new Error("Unhandled case: " + x + " with: " + JSON.stringify(y));
}

interface NormalizedPartialSerializedNodeType
  extends latest.PartialSerializedNodeType {
  io_order: string[];
}

const normalize_node = (
  node: latest.PartialSerializedNodeType
): NormalizedPartialSerializedNodeType => {
  if (node.io === undefined) {
    node.io = {};
  }
  let ios = node.io;
  let io_order = node.io_order as string[] | undefined;
  if (io_order === undefined) {
    if (Array.isArray(ios)) {
      io_order = ios.map((io) => io.id);
      const new_io: { [key: string]: latest.IOType | undefined } = {};
      for (const io of ios) {
        new_io[io.id] = io;
      }
      ios = new_io;
    } else {
      io_order = Object.keys(node.io);
    }
  } else {
    if (Array.isArray(ios)) {
      const new_io: { [key: string]: latest.IOType | undefined } = {};
      for (const io of ios) {
        new_io[io.id] = io;
        if (!io_order.includes(io.id)) {
          io_order.push(io.id);
        }
      }
      ios = new_io;
    } else {
      for (const io in ios) {
        if (!io_order.includes(io)) {
          io_order.push(io);
        }
      }
    }
  }

  return { ...node, io_order, io: ios };
};

export { simple_updater, assertNever, normalize_node };
export type { NormalizedPartialSerializedNodeType };
