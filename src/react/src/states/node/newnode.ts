import { create } from "zustand";
import { deep_update } from "../../utils";

import { update_node } from "./update_node";
import { update_io } from "./update_io";
import { FuncNodesReactFlowZustandInterface } from "../fnrfzst.t";
import { TqdmState } from "../../frontend/utils/progressbar";
import { latest } from "../../types/versioned/versions.t";
import { DataStructure, JSONStructure } from "../../funcnodes/datastructures";
import {
  normalize_node,
  NormalizedPartialSerializedNodeType,
} from "./update_funcs";

const dummy_node: latest.SerializedNodeType = {
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

const dummy_node_string = JSON.stringify(dummy_node);

const dummy_nodeio: latest.SerializedIOType = {
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
  emit_value_set: true,
  required: false,
};

const dummy_io_string = JSON.stringify(dummy_nodeio);
const deserialize_io = (
  fnrfz: FuncNodesReactFlowZustandInterface,
  io: latest.SerializedIOType
): latest.IOType => {
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

  const new_io: latest.IOType = {
    ...io,
    try_get_full_value,
    set_hidden,
  };
  return new_io;
};

const assert_full_nodeio = (
  fnrfz: FuncNodesReactFlowZustandInterface,
  io: latest.PartialSerializedIOType
): latest.IOType => {
  if (!io.id) {
    throw new Error(
      "IO must have an id but is missing for " + JSON.stringify(io)
    );
  }

  if (io.name === undefined) {
    io.name = io.id;
  }

  const { new_obj } = deep_update(io, JSON.parse(dummy_io_string));

  if (
    new_obj.render_options.type === "any" ||
    new_obj.render_options.type === undefined
  )
    new_obj.render_options.type = new_obj.type;

  return deserialize_io(fnrfz, new_obj);
};

const createIOStore = (
  nodestore: latest.NodeStore,
  fnrfz: FuncNodesReactFlowZustandInterface,
  io: latest.SerializedIOType
): latest.IOStore => {
  let iostore: latest.IOStore;
  if (nodestore === undefined) {
    throw new Error("nodestore is undefined");
  }
  iostore = {
    _state: create<latest.IOType>((_set, _get) =>
      assert_full_nodeio(fnrfz, io)
    ),
    use: () => {
      return iostore._state();
    },
    getState: () => {
      return iostore._state.getState();
    },
    setState: (new_state: Partial<latest.IOType>) => {
      iostore._state.setState(new_state);
    },
    update: (new_state: latest.PartialSerializedIOType) => {
      update_io(iostore, new_state);
    },
    valuestore: create<latest.ValueStoreInterface>((_set, _get) => {
      let preview = io.value;
      if (preview === "<NoValue>") {
        preview = undefined;
      }
      if (!(preview instanceof DataStructure) && preview !== undefined) {
        preview = JSONStructure.fromObject(preview);
      }

      let full = io.fullvalue;
      if (full === "<NoValue>") {
        full = undefined;
      }
      if (!(full instanceof DataStructure) && full !== undefined) {
        full = JSONStructure.fromObject(full);
      }

      return {
        preview: preview,
        full: full,
      };
    }),
    updateValueStore: (newData: Partial<latest.ValueStoreInterface>) => {
      iostore.valuestore.setState((state) => {
        // If the current data has a dispose method, call it
        if (state.preview && typeof state.preview.dispose === "function") {
          state.preview.dispose();
        }
        if (state.full && typeof state.full.dispose === "function") {
          state.full.dispose();
        }

        // if preview is updated but full is not, clear full
        if (newData.preview !== undefined && newData.full === undefined) {
          newData.full = undefined;
          state.full = undefined;
        }

        if (
          newData.preview !== undefined &&
          !(newData.preview instanceof DataStructure)
        ) {
          newData.preview = JSONStructure.fromObject(newData.preview);
        }

        if (
          newData.full !== undefined &&
          !(newData.full instanceof DataStructure)
        ) {
          newData.full = JSONStructure.fromObject(newData.full);
        }

        // Return new state with the updated data
        return { ...state, ...newData };
      });
    },
    node: nodestore,
    serialize: () => {
      const state = iostore._state.getState();
      const values = iostore.valuestore.getState();
      const serialized_io: latest.SerializedIOType = {
        ...state,
        value: values.preview,
        fullvalue: values.full,
        render_options: state.render_options,
        valuepreview_type: state.valuepreview_type,
        emit_value_set: state.emit_value_set,
      };
      return serialized_io;
    },
  };

  return iostore;
};

interface NormalizedSerializedNodeType extends latest.SerializedNodeType {}

const deserialize_node = (
  nodestore: latest.NodeStore,
  fnrfz: FuncNodesReactFlowZustandInterface,
  node: NormalizedSerializedNodeType
): latest.NodeType => {
  const io_order = node.io_order;
  if (io_order === undefined) {
    throw new Error("Node must have io_order");
  }

  const new_node: latest.NodeType = {
    ...node,
    in_trigger: create<boolean>(() => false),
    inputs: Object.keys(node.io).filter((key) => node.io[key]!.is_input),
    outputs: Object.keys(node.io).filter((key) => !node.io[key]!.is_input),
    io: Object.fromEntries(
      Object.entries(node.io).map(([name, value]) => [
        name,
        createIOStore(nodestore, fnrfz, value!),
      ])
    ),
    io_order,
    progress: create<TqdmState>(() => node.progress),
  };
  return new_node;
};

const assert_full_node = (
  nodestore: latest.NodeStore,
  fnrfz: FuncNodesReactFlowZustandInterface,
  node: NormalizedPartialSerializedNodeType
): latest.NodeType => {
  if (!node.id) {
    throw new Error("Node must have an id");
  }

  const { new_obj } = deep_update<NormalizedSerializedNodeType>(
    node,
    JSON.parse(dummy_node_string)
  );

  const desernode: latest.NodeType = deserialize_node(
    nodestore,
    fnrfz,
    new_obj
  );

  return desernode;
};

const createNodeStore = (
  fnrfz: FuncNodesReactFlowZustandInterface,
  node: latest.SerializedNodeType
): latest.NodeStore => {
  // check if node is Object
  const _nodestore: Omit<latest.NodeStore, "_state"> = {
    use: () => {
      return nodestore._state();
    },
    getState: () => {
      return nodestore._state.getState();
    },
    setState: (new_state: Partial<latest.NodeType>) => {
      nodestore._state.setState(new_state);
    },
    update: (new_state: latest.PartialSerializedNodeType) => {
      update_node(nodestore._state, new_state);
    },
    serialize: () => {
      const state = nodestore._state.getState();
      const serialized_node: latest.SerializedNodeType = {
        ...state,
        io: Object.fromEntries(
          Object.entries(state.io).map(([name, value]) => [
            name,
            value?.serialize(),
          ])
        ),
        in_trigger: state.in_trigger.getState(),
        progress: state.progress.getState(),
      };
      return serialized_node;
    },
  };
  const nodestore = _nodestore as latest.NodeStore;
  nodestore._state = create<latest.NodeType>((_set, _get) => {
    return assert_full_node(nodestore, fnrfz, normalize_node(node));
  });

  return nodestore;
};

export { createNodeStore };
