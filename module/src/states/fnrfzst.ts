import LibZustand from "./lib";
import NodeSpaceZustand from "./nodespace";
import { assert_full_node, createNodeStore, normalize_node } from "./node";
import { PartialIOType } from "./nodeio.t";
import reactflowstore from "./reactflow";
import {
  Node as RFNode,
  NodeChange,
  EdgeChange,
  Edge as RFEdge,
  Connection as RFConnection,
} from "reactflow";
import { NodeAction, NodeStore } from "./node.t";
import { deep_merge } from "../utils";
import { generate_edge_id } from "./edge";
import { EdgeAction } from "./edge.t";
import { create } from "zustand";

import type {
  FuncNodesReactFlowZustandInterface,
  ProgressState,
  RenderOptions,
  WorkersState,
  FuncnodesReactFlowProps,
  FuncnodesReactFlowLocalSettings,
  FuncnodesReactFlowViewSettings,
  FuncnodesReactFlowLocalState,
} from "./fnrfzst.t";
import type {
  NodeActionAdd,
  NodeActionDelete,
  NodeActionError,
  NodeActionTrigger,
  NodeActionUpdate,
  NodeType,
} from "./node.t";
import FuncNodesReactPlugin from "../plugin";
import { ConsoleLogger, INFO } from "../utils/logger";
import FuncNodesWorker, {
  FuncNodesWorkerState,
} from "../funcnodes/funcnodesworker";

const _fill_node_frontend = (
  node: NodeType,
  fnrf_instance?: FuncNodesReactFlowZustandInterface
) => {
  const frontend = node.frontend || {};
  if (!frontend.size) {
    frontend.size = [200, 100];
  }

  if (
    !frontend.pos ||
    frontend.pos.length !== 2 ||
    isNaN(frontend.pos[0]) ||
    frontend.pos[0] === null ||
    isNaN(frontend.pos[1]) ||
    frontend.pos[1] === null
  ) {
    if (
      !fnrf_instance ||
      !fnrf_instance.rf_instance ||
      fnrf_instance.reactflowRef === null
    ) {
      frontend.pos = [0, 0];
    } else {
      const ref = fnrf_instance.reactflowRef;
      const rect = ref.getBoundingClientRect(); // Step 2: Get bounding rectangle
      const centerX = rect.left + rect.width / 2; // Calculate center X
      const centerY = rect.top + rect.height / 2; // Calculate center Y
      const flowpos = fnrf_instance.rf_instance.screenToFlowPosition({
        x: centerX,
        y: centerY,
      });
      frontend.pos = [
        flowpos.x - frontend.size[0] / 2,
        flowpos.y - frontend.size[1] / 2,
      ];
    }
  }

  if (!frontend.collapsed) {
    frontend.collapsed = false;
  }
  node.frontend = frontend;
};

const assert_react_flow_io = (
  io: PartialIOType,
  fnrf_instance?: FuncNodesReactFlowZustandInterface
): PartialIOType => {
  if (io.value === "<NoValue>") {
    io.value = undefined;
  }
  if (io.fullvalue === "<NoValue>") {
    io.fullvalue = undefined;
  }

  if (io.try_get_full_value === undefined) {
    io.try_get_full_value = () => {
      if (!fnrf_instance) {
        return;
      }
      if (io.node === undefined || io.id === undefined) {
        return;
      }
      fnrf_instance.worker?.get_io_full_value({ nid: io.node, ioid: io.id });
    };
  }

  if (io.hidden === undefined) {
    io.hidden = false;
  }
  if (io.set_hidden === undefined) {
    io.set_hidden = (v: boolean) => {
      if (!fnrf_instance) {
        return;
      }
      if (io.node === undefined || io.id === undefined) {
        return;
      }
      fnrf_instance.worker?.update_io_options({
        nid: io.node,
        ioid: io.id,
        options: { hidden: v },
      });
    };
  }

  return io;
};
const assert_reactflow_node = (
  node: NodeType,
  store: NodeStore,
  fnrf_instance?: FuncNodesReactFlowZustandInterface
): NodeType & RFNode => {
  _fill_node_frontend(node, fnrf_instance);

  node = assert_full_node(node);
  if (node.id === undefined) {
    throw new Error("Node must have an id");
  }

  for (const io in node.io) {
    node.io[io].node = node.id;
    assert_react_flow_io(node.io[io], fnrf_instance);
  }

  const extendedNode: NodeType & RFNode = {
    position: {
      x: node.frontend.pos[0],
      y: node.frontend.pos[1],
    },
    data: {
      UseNodeStore: store,
    },
    type: "default",
    ...node,
  };

  return extendedNode;
};

const FuncNodesReactFlowZustand = ({
  useWorkerManager = true,
  default_worker = undefined,
  on_sync_complete = undefined,
}: FuncnodesReactFlowProps): FuncNodesReactFlowZustandInterface => {
  /*
  function that should be called when the remote node, e.g. in the python worker is performing an action
  */

  const options: FuncnodesReactFlowProps = {
    useWorkerManager: useWorkerManager,
    default_worker: default_worker,
    on_sync_complete: on_sync_complete,
  };

  const _add_node = (action: NodeActionAdd) => {
    const rfstate = rfstore.getState();
    if (action.from_remote) {
      let store = ns.get_node(action.node.id, false);

      if (!store) {
        try {
          store = createNodeStore(action.node);
          ns.nodesstates.set(action.node.id, store);
        } catch (e) {
          return;
        }
      }

      const node = store.getState();
      const new_ndoes = [
        ...rfstate.nodes,
        assert_reactflow_node(node, store, iterf),
      ];
      rfstore.setState({ nodes: new_ndoes });

      // wait 200 ms then set the full value of all ios

      for (const io in action.node.io) {
        const ioid = action.node.io[io].id;
        if (ioid !== undefined) {
          iterf.worker?.get_io_value({ nid: action.node.id, ioid: ioid });
        }
      }
    }
  };

  const _update_node = (action: NodeActionUpdate) => {
    // some action reset the error, so far trigger does, so errors should remove the in_trigger flag
    if (action.node.in_trigger) {
      action.node.error = undefined;
    }
    if (action.from_remote) {
      const store = ns.get_node(action.id);
      if (!store) {
        return;
      }

      normalize_node(action.node);

      const state = store.getState();
      const { new_obj, change } = deep_merge(state, action.node);

      if (change) {
        // update ios after merge, because it might be an object whch would resolt of
        // some part of the old value still being there (on the frontend)
        if (action.node.io) {
          for (const io in action.node.io) {
            // if fullvalue is in the update data, set to fullvalue otherwise set to undefined
            new_obj.io[io].fullvalue = action.node.io[io]?.fullvalue;

            for (const io in action.node.io) {
              const ioobj = action.node.io[io] as PartialIOType;
              const new_obj_io = new_obj.io[io];
              // check if value in io, undefined is a valid value
              if (ioobj.hasOwnProperty("value")) {
                if (ioobj.value === undefined) {
                  new_obj_io.value = null;
                } else if (ioobj.value === "<NoValue>") {
                  new_obj_io.value = undefined;
                } else {
                  new_obj_io.value = ioobj.value;
                }
              }
            }
          }
        }

        assert_reactflow_node(new_obj, store, iterf);
        iterf.logger.debug("update_action", new_obj);
        store.setState(assert_full_node(new_obj));
      }
    } else {
      if (iterf.worker) {
        iterf.worker.locally_update_node(action);
      }
    }
  };

  const _delete_node = (action: NodeActionDelete) => {
    if (action.from_remote) {
      rfstore.getState().onNodesChange([
        {
          type: "remove",
          id: action.id,
        },
      ]);
    } else {
      iterf.worker?.remove_node(action.id);
    }
  };

  const _error_action = (action: NodeActionError) => {
    iterf.logger.error("Error", action);
    on_node_action({
      type: "update",
      id: action.id,
      node: {
        in_trigger: false,
        error: action.error,
      },
      from_remote: true,
    });
  };

  const _trigger_action = (action: NodeActionTrigger) => {
    if (action.from_remote) {
      on_node_action({
        type: "update",
        id: action.id,
        node: {
          in_trigger: true,
          error: undefined,
        },
        from_remote: true,
      });
    } else {
      iterf.worker?.trigger_node(action.id);
    }
  };

  const on_node_action = (action: NodeAction) => {
    switch (action.type) {
      case "add":
        _add_node(action);
        break;
      case "update":
        _update_node(action);
        break;
      case "delete":
        _delete_node(action);
        break;
      case "error":
        _error_action(action);
        break;
      case "trigger":
        _trigger_action(action);
        break;
      default:
        iterf.logger.error("Unknown node action", action);
    }
  };

  const on_edge_action = (action: EdgeAction) => {
    const rfstate = rfstore.getState();

    switch (action.type) {
      case "add":
        if (action.from_remote) {
          const edges = rfstate.edges;
          const new_edge_id = generate_edge_id(action);

          //cehck if edge already exists including reversed
          if (edges.some((e) => e.id === new_edge_id)) {
            return;
          }
          const new_edge: RFEdge = {
            id: new_edge_id,
            source: action.src_nid,
            target: action.trg_nid,
            sourceHandle: action.src_ioid,
            targetHandle: action.trg_ioid,
            className: "funcnodes-edge animated",
          };

          iterf.logger.info("Adding edge", new_edge);

          rfstore.setState({ edges: [...edges, new_edge] });
          iterf.worker?.get_remote_node_state(action.src_nid);
          iterf.worker?.get_remote_node_state(action.trg_nid);
        } else {
        }
        break;

      case "delete":
        if (action.from_remote) {
          const edges = rfstate.edges;
          const del_edge_id = generate_edge_id(action);
          const new_edges = edges.filter((edge) => edge.id !== del_edge_id);
          rfstore.setState({ edges: new_edges });
          iterf.worker?.get_remote_node_state(action.src_nid);
          iterf.worker?.get_remote_node_state(action.trg_nid);
        } else {
        }
        break;
      default:
        iterf.logger.error("Unknown edge action", action);
    }
  };
  /*
  on_node_cahnge is called by react flow when a note change event is fired
  should update the local state if something changed
  */
  const on_node_change = (nodechange: NodeChange[]) => {
    for (const change of nodechange) {
      switch (change.type) {
        case "position":
          if (change.position) {
            on_node_action({
              type: "update",
              id: change.id,
              node: {
                frontend: { pos: [change.position.x, change.position.y] },
              },
              from_remote: false,
            });
          }
          break;
        case "dimensions":
          if (change.dimensions) {
            on_node_action({
              type: "update",
              id: change.id,
              node: {
                frontend: {
                  size: [change.dimensions.width, change.dimensions.height],
                },
              },
              from_remote: false,
            });
          }
          break;
      }
    }
  };

  const on_edge_change = (_edgechange: EdgeChange[]) => {};

  const on_connect = (connection: RFConnection) => {
    if (
      connection.source === null ||
      connection.target === null ||
      connection.sourceHandle === null ||
      connection.targetHandle === null ||
      !iterf.worker
    ) {
      return;
    }
    iterf.worker.add_edge({
      src_nid: connection.source,
      src_ioid: connection.sourceHandle,
      trg_nid: connection.target,
      trg_ioid: connection.targetHandle,
      replace: true,
    });
  };

  const rfstore = reactflowstore({
    on_node_change,
    on_edge_change,
    on_connect,
  });
  const ns = NodeSpaceZustand({});
  const lib = LibZustand();

  const clear_all = () => {
    iterf.worker?.disconnect();
    iterf.set_worker(undefined);
    iterf.workermanager?.setWorker(undefined);
    iterf.lib.libstate
      .getState()
      .set({ lib: { shelves: [] }, external_worker: [] });
    iterf.nodespace.nodesstates.clear();
    iterf.useReactFlowStore.setState({ nodes: [], edges: [] });
    iterf.auto_progress();
  };
  const iterf: FuncNodesReactFlowZustandInterface = {
    local_settings: create<FuncnodesReactFlowLocalSettings>((_set, _get) => ({
      view_settings: {
        expand_node_props: false,
      },
      update_view_settings: (settings: FuncnodesReactFlowViewSettings) => {
        const current = iterf.local_settings.getState().view_settings;
        const { new_obj, change } = deep_merge(current, settings);
        if (change) {
          iterf.local_settings.setState((prev) => ({
            ...prev,
            view_settings: new_obj,
          }));
        }
      },
    })),

    local_state: create<FuncnodesReactFlowLocalState>((_set, _get) => ({
      selected_nodes: [],
      selected_edges: [],
    })),

    options: options,
    lib: lib,
    workermanager: undefined,
    workers: create<WorkersState>((_set, _get) => ({})),
    workerstate: create<FuncNodesWorkerState>((_set, _get) => ({
      is_open: false,
    })),

    render_options: create<RenderOptions>((_set, _get) => ({})),
    progress_state: create<ProgressState>((_set, _get) => ({
      message: "please select worker",
      status: "info",
      progress: 0,
      blocking: false,
    })),
    update_render_options: (options: RenderOptions) => {
      const current = iterf.render_options.getState();
      const { new_obj, change } = deep_merge(current, options);
      if (change) {
        iterf.render_options.setState(new_obj);
      }
    },
    worker: undefined,
    _unsubscribeFromWorker: undefined,
    set_worker: (worker: FuncNodesWorker | undefined) => {
      if (worker === iterf.worker) {
        return;
      }

      if (iterf._unsubscribeFromWorker) {
        iterf._unsubscribeFromWorker();
        iterf._unsubscribeFromWorker = undefined;
      }

      // If new worker is provided
      if (worker) {
        iterf._unsubscribeFromWorker = worker.state.subscribe((newState) => {
          iterf.workerstate.setState(newState);
        });

        iterf.workerstate.setState(worker.state.getState());
      }

      // Update the reference
      iterf.worker = worker;
      worker?.set_zustand(iterf);
    },
    nodespace: ns,
    useReactFlowStore: rfstore,
    on_node_action: on_node_action,
    on_edge_action: on_edge_action,
    reactflowRef: null,
    clear_all: clear_all,
    set_progress: (progress: ProgressState) => {
      if (progress.message === "") {
        return iterf.auto_progress();
      }

      const prev_state = iterf.progress_state.getState();
      const { new_obj, change } = deep_merge<ProgressState>(
        prev_state,
        progress
      );
      if (change) {
        iterf.progress_state.setState(new_obj);
      }
    },
    auto_progress: () => {
      if (iterf.worker === undefined) {
        return iterf.set_progress({
          progress: 0,
          message: "please select worker",
          status: "error",
          blocking: false,
        });
      }
      if (!iterf.worker.is_open) {
        return iterf.set_progress({
          progress: 0,
          message: "connecting to worker",
          status: "info",
          blocking: true,
        });
      }
      iterf.set_progress({
        progress: 1,
        message: "running",
        status: "info",
        blocking: false,
      });
    },
    plugins: create<{
      [key: string]: FuncNodesReactPlugin;
    }>((_set, _get) => ({})),
    add_plugin: (name: string, plugin: any) => {
      if (plugin === undefined) return;
      iterf.plugins.setState((prev) => {
        return { ...prev, [name]: plugin };
      });
    },
    dev_settings: {
      debug: true,
    },

    logger: new ConsoleLogger("fn", INFO),
  };
  return iterf;
};

export default FuncNodesReactFlowZustand;
export { LibZustand, NodeSpaceZustand, assert_reactflow_node };
