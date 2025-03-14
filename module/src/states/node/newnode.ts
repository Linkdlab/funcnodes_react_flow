import { create } from "zustand";
import { deep_update } from "../../utils";
import {
  NodeStore,
  NodeType,
  PartialSerializedNodeType,
  SerializedNodeType,
} from "../node.t";
import {
  IOStore,
  IOType,
  PartialSerializedIOType,
  SerializedIOType,
  ValueStoreInterface,
} from "../nodeio.t";

import { update_node } from "./update_node";
import { update_io } from "./update_io";
import { FuncNodesReactFlowZustandInterface } from "../fnrfzst.t";
import { TqdmState } from "../../frontend/utils/progressbar";

const dummy_node: SerializedNodeType = {
  id: "dummy",
  node_id: "dummy",
  node_name: "dummy",
  properties: {
    "frontend:size": [200, 100],
    "frontend:pos": [NaN, NaN],
    "frontend:collapsed": false,
  },
  io: {},
  name: "dummy",
  in_trigger: false,
  progress: {
    ascii: false,
    elapsed: 0,
    initial: 0,
    n: 0,
    prefix: "idle",
    unit: "it",
    unit_divisor: 1000,
    unit_scale: false,
  },
};

const dummy_nodeio: SerializedIOType = {
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
  render_options: {
    set_default: true,
    type: "any",
  },
  hidden: false,
};

interface NormalizedPartialSerializedNodeType
  extends PartialSerializedNodeType {
  io_order: string[];
}

interface NormalizedSerializedNodeType extends SerializedNodeType {}

const normalize_node = (
  node: PartialSerializedNodeType
): NormalizedPartialSerializedNodeType => {
  if (node.io === undefined) {
    node.io = {};
  }
  let ios = node.io;
  let io_order = node.io_order as string[] | undefined;
  if (io_order === undefined) {
    if (Array.isArray(ios)) {
      io_order = ios.map((io) => io.id);
      const new_io: { [key: string]: IOType } = {};
      for (const io of ios) {
        new_io[io.id] = io;
      }
      ios = new_io;
    } else {
      io_order = Object.keys(node.io);
    }
  } else {
    if (Array.isArray(ios)) {
      const new_io: { [key: string]: IOType } = {};
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

const deserialize_io = (
  fnrfz: FuncNodesReactFlowZustandInterface,
  io: SerializedIOType
): IOType => {
  const try_get_full_value = () => {
    if (io.node === undefined || io.id === undefined) {
      return;
    }
    fnrfz.worker?.get_io_full_value({ nid: io.node, ioid: io.id });
  };

  if (io.value === "<NoValue>") {
    io.value = undefined;
  }
  if (io.fullvalue === "<NoValue>") {
    io.fullvalue = undefined;
  }

  if (io.hidden === undefined) {
    io.hidden = false;
  }

  const set_hidden = (v: boolean) => {
    if (io.node === undefined || io.id === undefined) {
      return;
    }
    fnrfz.worker?.update_io_options({
      nid: io.node,
      ioid: io.id,
      options: { hidden: v },
    });
  };

  const new_io: IOType = {
    ...io,
    try_get_full_value,
    set_hidden,
  };
  return new_io;
};

const assert_full_nodeio = (
  fnrfz: FuncNodesReactFlowZustandInterface,
  io: PartialSerializedIOType
): IOType => {
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

  return deserialize_io(fnrfz, new_obj);
};

const createIOStore = (
  nodestore: NodeStore,
  fnrfz: FuncNodesReactFlowZustandInterface,
  io: SerializedIOType
): IOStore => {
  let iostore: IOStore;
  if (nodestore === undefined) {
    throw new Error("nodestore is undefined");
  }
  iostore = {
    _state: create<IOType>((_set, _get) => assert_full_nodeio(fnrfz, io)),
    use: () => {
      return iostore._state();
    },
    getState: () => {
      return iostore._state.getState();
    },
    setState: (new_state: Partial<IOType>) => {
      iostore._state.setState(new_state);
    },
    update: (new_state: PartialSerializedIOType) => {
      update_io(iostore, new_state);
    },
    valuestore: create<ValueStoreInterface>((_set, _get) => {
      return {
        preview: io.value,
        full: io.fullvalue,
      };
    }),
    node: nodestore,
  };

  return iostore;
};

const deserialize_node = (
  nodestore: NodeStore,
  fnrfz: FuncNodesReactFlowZustandInterface,
  node: NormalizedSerializedNodeType
): NodeType => {
  const io_order = node.io_order;
  if (io_order === undefined) {
    throw new Error("Node must have io_order");
  }

  const new_node: NodeType = {
    ...node,
    in_trigger: create<boolean>(() => false),
    inputs: Object.keys(node.io).filter((key) => node.io[key].is_input),
    outputs: Object.keys(node.io).filter((key) => !node.io[key].is_input),
    io: Object.fromEntries(
      Object.entries(node.io).map(([name, value]) => [
        name,
        createIOStore(nodestore, fnrfz, value),
      ])
    ),
    io_order,
    progress: create<TqdmState>(() => node.progress),
  };
  return new_node;
};

const assert_full_node = (
  nodestore: NodeStore,
  fnrfz: FuncNodesReactFlowZustandInterface,
  node: NormalizedPartialSerializedNodeType
): NodeType => {
  if (!node.id) {
    throw new Error("Node must have an id");
  }

  const { new_obj } = deep_update<NormalizedSerializedNodeType>(
    node,
    dummy_node
  );

  const desernode: NodeType = deserialize_node(nodestore, fnrfz, new_obj);

  return desernode;
};

const createNodeStore = (
  fnrfz: FuncNodesReactFlowZustandInterface,
  node: SerializedNodeType
): NodeStore => {
  // check if node is Object
  const _nodestore: Omit<NodeStore, "_state"> = {
    use: () => {
      return nodestore._state();
    },
    getState: () => {
      return nodestore._state.getState();
    },
    setState: (new_state: Partial<NodeType>) => {
      nodestore._state.setState(new_state);
    },
    update: (new_state: PartialSerializedNodeType) => {
      update_node(nodestore._state, new_state);
    },
  };
  const nodestore = _nodestore as NodeStore;
  nodestore._state = create<NodeType>((_set, _get) => {
    return assert_full_node(nodestore, fnrfz, normalize_node(node));
  });

  return nodestore;
};

export { createNodeStore };
export type { NormalizedPartialSerializedNodeType };
