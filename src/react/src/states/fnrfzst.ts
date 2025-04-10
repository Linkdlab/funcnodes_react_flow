import LibZustand from "./lib";
import NodeSpaceZustand from "./nodespace";
import { createNodeStore } from "./node/newnode";

import reactflowstore from "./reactflow";
import {
  Node as RFNode,
  NodeChange,
  EdgeChange,
  Edge as RFEdge,
  Connection as RFConnection,
} from "@xyflow/react";

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
import { upgradeFuncNodesReactPlugin } from "../plugin";
import { ConsoleLogger, INFO, DEBUG } from "../utils/logger";
import FuncNodesWorker, {
  FuncNodesWorkerState,
} from "../funcnodes/funcnodesworker";
import { RFNodeDataPass } from "../frontend/node/node";

import { latest } from "../types/versioned/versions.t";
import { development } from "../utils/debugger";

const _fill_node_frontend = (
  node: latest.NodeType,
  fnrf_instance?: FuncNodesReactFlowZustandInterface
) => {
  const nodeprops = node.properties || {};
  if (!nodeprops["frontend:size"]) {
    nodeprops["frontend:size"] = [200, 100];
  }

  const frontend_pos = nodeprops["frontend:pos"];
  if (
    !frontend_pos ||
    frontend_pos.length !== 2 ||
    isNaN(frontend_pos[0]) ||
    frontend_pos[0] === null ||
    isNaN(frontend_pos[1]) ||
    frontend_pos[1] === null
  ) {
    if (
      !fnrf_instance ||
      !fnrf_instance.rf_instance ||
      fnrf_instance.reactflowRef === null
    ) {
      nodeprops["frontend:pos"] = [0, 0];
    } else {
      const ref = fnrf_instance.reactflowRef;
      const rect = ref.getBoundingClientRect(); // Step 2: Get bounding rectangle
      const centerX = rect.left + rect.width / 2; // Calculate center X
      const centerY = rect.top + rect.height / 2; // Calculate center Y
      const flowpos = fnrf_instance.rf_instance.screenToFlowPosition({
        x: centerX,
        y: centerY,
      });
      nodeprops["frontend:pos"] = [
        flowpos.x - nodeprops["frontend:size"][0] / 2,
        flowpos.y - nodeprops["frontend:size"][0] / 2,
      ];
    }
  }

  if (!nodeprops["frontend:collapsed"]) {
    nodeprops["frontend:collapsed"] = false;
  }
  node.properties = nodeprops;
};

const assert_reactflow_node = (
  store: latest.NodeStore,
  fnrf_instance?: FuncNodesReactFlowZustandInterface
): latest.NodeType & RFNode => {
  const node = store.getState();
  _fill_node_frontend(node, fnrf_instance);

  if (node.id === undefined) {
    throw new Error("Node must have an id");
  }

  const data: RFNodeDataPass = {
    nodestore: store,
  };

  const extendedNode: latest.NodeType & RFNode = {
    position: {
      x: node.properties["frontend:pos"][0],
      y: node.properties["frontend:pos"][1],
    },
    data: data,
    type: "default",
    ...node,
  };

  return extendedNode;
};

const FuncNodesReactFlowZustand = (
  props: FuncnodesReactFlowProps
): FuncNodesReactFlowZustandInterface => {
  /*
  function that should be called when the remote node, e.g. in the python worker is performing an action
  */

  const options: FuncnodesReactFlowProps = {
    ...props,
  };

  const _add_node = (action: latest.NodeActionAdd) => {
    const rfstate = rfstore.getState();
    if (action.from_remote) {
      let store = ns.get_node(action.node.id, false);
      if (store) {
        return;
      }
      if (!store) {
        try {
          store = createNodeStore(iterf, action.node);
          ns.nodesstates.set(action.node.id, store);
        } catch (e) {
          iterf.logger.error(`Failed to create node store ${e}`);
          return;
        }
      }

      const node = store.getState();

      iterf.logger.info("Add node", node.id, node.name);

      const new_ndoes = [...rfstate.nodes, assert_reactflow_node(store, iterf)];
      rfstore.setState({ nodes: new_ndoes });

      for (const io in action.node.io) {
        const ioid = action.node.io[io]!.id;
        if (ioid !== undefined) {
          iterf.worker?.get_io_value({ nid: action.node.id, ioid: ioid });
        }
      }

      setTimeout(() => {
        iterf.worker?.call_hooks("node_added", { node: node.id });
      }, 0);
    }
  };

  const _update_node = (action: latest.NodeActionUpdate) => {
    // some action reset the error, so far trigger does, so errors should remove the in_trigger flag
    if (action.node.in_trigger) {
      action.node.error = undefined;
    }
    if (action.from_remote) {
      const store = ns.get_node(action.id, false);
      if (!store) {
        console.error("Node not found to update", action.id);
        return;
      }

      store.update(action.node);
    } else {
      if (iterf.worker) {
        iterf.worker.locally_update_node(action);
      }
    }
  };

  const _delete_node = (action: latest.NodeActionDelete) => {
    iterf.logger.info("Deleting node", action.id);
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

  const _error_action = (action: latest.NodeActionError) => {
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

  const _trigger_action = (action: latest.NodeActionTrigger) => {
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

  const on_node_action = (action: latest.NodeAction) => {
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
          iterf.logger.info("Deleting edge", del_edge_id);
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
  on_node_change is called by react flow when a note change event is fired
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
                properties: {
                  "frontend:pos": [change.position.x, change.position.y],
                },
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
                properties: {
                  "frontend:size": [
                    change.dimensions.width,
                    change.dimensions.height,
                  ],
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

  const center_node = (node_id: string | string[]) => {
    if (!iterf.rf_instance) {
      return;
    }
    node_id = Array.isArray(node_id) ? node_id : [node_id];

    const nodes = iterf.useReactFlowStore
      .getState()
      .nodes.filter((node) => node_id.includes(node.id));

    if (nodes.length > 0) {
      iterf.rf_instance?.fitView({ padding: 0.2, nodes });
    }
  };

  const iterf: FuncNodesReactFlowZustandInterface = {
    local_settings: create<FuncnodesReactFlowLocalSettings>((_set, _get) => ({
      view_settings: {},
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
      funcnodescontainerRef: null,
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
    center_node: center_node,
    center_all: () => {
      console.log("center all", iterf.rf_instance);
      iterf.rf_instance?.fitView({ padding: 0.2 });
    },
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
      if (iterf.workermanager !== undefined && !iterf.workermanager.open) {
        return iterf.set_progress({
          progress: 0,
          message: "connecting to worker manager",
          status: "error",
          blocking: false,
        });
      }
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
      [key: string]: latest.FuncNodesReactPlugin | undefined;
    }>((_set, _get) => ({})),
    add_plugin: (name: string, plugin: latest.FuncNodesReactPlugin) => {
      if (plugin === undefined) return;
      const latestplugin = upgradeFuncNodesReactPlugin(plugin);
      iterf.plugins.setState((prev) => {
        return { ...prev, [name]: latestplugin };
      });
    },
    dev_settings: {
      debug: true,
    },

    logger: new ConsoleLogger("fn", development ? DEBUG : INFO),
  };
  return iterf;
};

export default FuncNodesReactFlowZustand;
export { LibZustand, NodeSpaceZustand, assert_reactflow_node };
