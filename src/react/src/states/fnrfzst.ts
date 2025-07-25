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
  NodePositionChange,
  NodeDimensionChange,
  applyNodeChanges,
} from "@xyflow/react";

import { generate_edge_id } from "./edge";
import { EdgeAction } from "./edge.t";
import { create } from "zustand";

import type {
  FuncNodesReactFlowZustandInterface,
  ProgressState,
  RenderOptions,
  FuncnodesReactFlowLocalSettings,
  FuncnodesReactFlowViewSettings,
  FuncnodesReactFlowLocalState,
} from "./fnrfzst.t";
import { upgradeFuncNodesReactPlugin } from "../plugin";

import { RFNodeDataPass } from "../features/nodes";

import { latest } from "../types/versioned/versions.t";
import { GroupAction, GroupActionUpdate } from "./groups.t";
import { sortByParent, split_rf_nodes } from "../utils/nodes";
import { ConsoleLogger, DEBUG, INFO } from "@/logging";
import { deep_merge } from "@/object-helpers";
import { FuncnodesReactFlowProps } from "@/app";
import { FuncNodesWorker, FuncNodesWorkerState, WorkersState } from "@/workers";
import { AnyFuncNodesRFNode, GroupRFNode } from "@/nodes";
import { NodeGroups } from "@/groups";
import { development } from "@/utils/debugger";

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
    zIndex: 1003,
    // expandParent: true,
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

  const _add_node = (
    action: latest.NodeActionAdd
  ): latest.NodeType | undefined => {
    const rfstate = rfstore.getState();
    if (action.from_remote) {
      let store = ns.get_node(action.node.id, false);
      if (store) {
        return undefined;
      }
      if (!store) {
        try {
          store = createNodeStore(iterf, action.node);
          ns.nodesstates.set(action.node.id, store);
        } catch (e) {
          iterf.logger.error(`Failed to create node store ${e}`);
          return undefined;
        }
      }

      const node = store.getState();

      iterf.logger.info("Add node", node.id, node.name);

      const new_ndoes = [
        ...rfstate.getNodes(),
        assert_reactflow_node(store, iterf),
      ];
      rfstore.getState().update_nodes(new_ndoes);

      for (const io in action.node.io) {
        const ioid = action.node.io[io]!.id;
        if (ioid !== undefined) {
          iterf.worker?.get_io_value({ nid: action.node.id, ioid: ioid });
        }
      }

      setTimeout(() => {
        iterf.worker?.call_hooks("node_added", { node: node.id });
      }, 0);
      return node;
    }
    return undefined;
  };

  const _update_node = (
    action: latest.NodeActionUpdate
  ): latest.NodeType | undefined => {
    // some action reset the error, so far trigger does, so errors should remove the in_trigger flag
    if (action.node.in_trigger) {
      action.node.error = undefined;
    }
    if (action.from_remote) {
      const store = ns.get_node(action.id, false);
      if (!store) {
        console.error("Node not found to update", action.id);
        return undefined;
      }

      store.update(action.node);
      return store.getState();
    } else {
      if (iterf.worker) {
        iterf.worker.locally_update_node(action);
      }
    }
    return undefined;
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
    return undefined;
  };

  const _error_action = (action: latest.NodeActionError) => {
    iterf.logger.error("Error", action);
    return on_node_action({
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
      return on_node_action({
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
    return undefined;
  };

  const on_node_action = (
    action: latest.NodeAction
  ): latest.NodeType | undefined => {
    switch (action.type) {
      case "add":
        return _add_node(action);
      case "update":
        return _update_node(action);
      case "delete":
        return _delete_node(action);
      case "error":
        return _error_action(action);
      case "trigger":
        return _trigger_action(action);
      default:
        iterf.logger.error("Unknown node action", action);
        return undefined;
    }
  };

  const on_edge_action = (action: EdgeAction) => {
    const rfstate = rfstore.getState();

    switch (action.type) {
      case "add":
        if (action.from_remote) {
          const edges = rfstate.getEdges();
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

          rfstate.update_edges([...edges, new_edge]);
          iterf.worker?.get_remote_node_state(action.src_nid);
          iterf.worker?.get_remote_node_state(action.trg_nid);
        } else {
        }
        break;

      case "delete":
        if (action.from_remote) {
          const edges = rfstate.getEdges();
          const del_edge_id = generate_edge_id(action);
          iterf.logger.info("Deleting edge", del_edge_id);
          const new_edges = edges.filter((edge) => edge.id !== del_edge_id);
          rfstate.update_edges(new_edges);
          iterf.worker?.get_remote_node_state(action.src_nid);
          iterf.worker?.get_remote_node_state(action.trg_nid);
        } else {
        }
        break;
      default:
        iterf.logger.error("Unknown edge action", action);
    }
  };

  const _set_groups = (groups: NodeGroups) => {
    const rfstate = rfstore.getState();
    const { default_nodes } = split_rf_nodes(rfstate.getNodes());
    const new_nodes: AnyFuncNodesRFNode[] = [...default_nodes];

    const node_group_map: Record<string, string> = {};
    for (const group_id in groups) {
      const group = groups[group_id];
      for (const node_id of group.node_ids) {
        node_group_map[node_id] = group_id;
      }
      for (const child_group_id of group.child_groups) {
        node_group_map[child_group_id] = group_id;
      }
      if (group.position === undefined) {
        group.position = [0, 0];
      }
      const group_node: GroupRFNode = {
        id: group_id,
        type: "group",
        data: { group: groups[group_id], id: group_id },
        position: { x: group.position[0], y: group.position[1] },
        zIndex: 2,
      };
      if (group.parent_group) {
        group_node.data.groupID = group.parent_group;
      }
      new_nodes.push(group_node);
    }

    for (const node of new_nodes) {
      if (node.id in node_group_map) {
        node.data.groupID = node_group_map[node.id];
      } else {
        node.data.groupID = undefined;
      }
    }
    const sorted_nodes = sortByParent(new_nodes);

    rfstate.update_nodes(sorted_nodes);
    //iterate in reverse over sorted_nodes:
    for (const node of sorted_nodes.reverse()) {
      if (node.type === "group") {
        auto_resize_group(node.id);
      }
    }
  };

  const _update_group = (action: GroupActionUpdate) => {
    if (action.from_remote) {
      const rfstate = rfstore.getState();
      const group = rfstate.getNode(action.id) as AnyFuncNodesRFNode;
      if (group === undefined) {
        return;
      }
      if (group.type !== "group") {
        return;
      }
      const { new_obj, change } = deep_merge(group.data.group, action.group);
      if (change) {
        group.data.group = new_obj;
      }
      rfstate.partial_update_nodes([group]);
    } else {
      if (iterf.worker) {
        iterf.worker.locally_update_group(action);
      }
    }
  };

  const on_group_action = (action: GroupAction) => {
    switch (action.type) {
      case "set":
        return _set_groups(action.groups);
      case "update":
        return _update_group(action);
      default:
        iterf.logger.error("Unknown group action", action);
    }
  };
  /*
  on_node_change is called by react flow when a note change event is fired
  should update the local state if something changed
  */

  const change_group_position = (change: NodePositionChange) => {
    if (change.position === undefined) {
      return;
    }
    const rfstate = rfstore.getState();

    const old_node = rfstate.getNode(change.id) as AnyFuncNodesRFNode;
    if (old_node === undefined) {
      return;
    }
    if (old_node.type !== "group") {
      return;
    }
    const child_node_ids = [
      ...old_node.data.group.node_ids,
      ...old_node.data.group.child_groups,
    ];
    const bounds = iterf.rf_instance?.getNodesBounds(child_node_ids);
    if (bounds === undefined) {
      return;
    }

    const delta_x = change.position.x - bounds?.x;
    const delta_y = change.position.y - bounds?.y;

    const child_changes: NodePositionChange[] = [];
    for (const node_id of child_node_ids) {
      const child_node = rfstate.getNode(node_id);
      if (child_node === undefined) {
        continue;
      }
      child_changes.push({
        id: node_id,
        type: "position",
        position: {
          x: child_node.position.x + delta_x,
          y: child_node.position.y + delta_y,
        },
      });
    }

    rfstate.onNodesChange(child_changes);
  };

  const change_group_dimensions = (change: NodeDimensionChange) => {
    if (change.dimensions === undefined) {
      return;
    }
    const rfstate = iterf.useReactFlowStore.getState();
    const group = rfstate.getNode(change.id);
    if (group === undefined) {
      return;
    }

    iterf.useReactFlowStore
      .getState()
      .partial_update_nodes(applyNodeChanges([change], [group]));
  };
  const change_fn_node_position = (change: NodePositionChange) => {
    if (change.position === undefined) {
      return;
    }
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
  };

  const change_fn_node_dimensions = (change: NodeDimensionChange) => {
    if (change.dimensions === undefined) {
      return;
    }
    on_node_action({
      type: "update",
      id: change.id,
      node: {
        properties: {
          "frontend:size": [change.dimensions.width, change.dimensions.height],
        },
      },
      from_remote: false,
    });
  };

  const auto_resize_group = (gid: string) => {
    const rfstate = iterf.useReactFlowStore.getState();
    const group = rfstate.getNode(gid) as AnyFuncNodesRFNode;
    if (group === undefined) {
      return;
    }
    if (group.type !== "group") {
      return;
    }
    const child_nodes = group.data.group.node_ids
      .map((nid: string) => rfstate.getNode(nid))
      .filter((node) => node !== undefined);
    const child_groups = group.data.group.child_groups
      .map((gid: string) => rfstate.getNode(gid))
      .filter((node) => node !== undefined);
    const all_nodes = [...child_nodes, ...child_groups];
    // console.log("all_nodes", all_nodes)
    const bounds = iterf.rf_instance?.getNodesBounds(all_nodes);
    if (bounds === undefined) {
      return;
    }
    const updated_group = {
      ...group,
      position: {
        x: bounds.x,
        y: bounds.y,
      },
      height: bounds.height,
      width: bounds.width,
    };
    updated_group.data.group.position = [bounds.x, bounds.y];
    rfstate.partial_update_nodes([updated_group]);

    // const min_x= Math.min(...all_nodes.map((node)=>node.position.x));
    // const min_y= Math.min(...all_nodes.map((node)=>node.position.y));

    // const oldx= group.position.x;
    // const oldy= group.position.y;
    // const deltax= min_x
    // const deltay= min_y

    // for (const node of all_nodes) {
    //   node.position.x -= deltax;
    //   node.position.y -= deltay;
    // }

    // const updatedGroup = {
    //   ...group,
    //   position: {
    //      x: oldx + deltax,
    //      y: oldy + deltay,
    //    },
    //   width: bounds.width,
    //   height: bounds.height,

    // }
    // rfstate.partial_update_nodes([updatedGroup, ...all_nodes]);
  };

  const on_rf_node_change = (nodechange: NodeChange[]) => {
    const rfstate = iterf.useReactFlowStore.getState();

    for (const change of nodechange) {
      switch (change.type) {
        case "position":
          if (change.position) {
            const node = rfstate.getNode(change.id) as AnyFuncNodesRFNode;
            if (node === undefined) {
              continue;
            }
            if (node.type === "group") {
              change_group_position(change);
            } else {
              change_fn_node_position(change);
            }
            if (node.data.groupID) {
              auto_resize_group(node.data.groupID);
            }
          }
          break;
        case "dimensions":
          if (change.dimensions) {
            const node = rfstate.getNode(change.id);
            if (node === undefined) {
              continue;
            }
            if (node.type === "group") {
              change_group_dimensions(change);
            } else {
              change_fn_node_dimensions(change);
            }

            if (node.data.groupID) {
              auto_resize_group(node.data.groupID as string);
            }
          }
          break;
      }
    }
  };

  const on_rf_edge_change = (_edgechange: EdgeChange[]) => {};

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
    on_node_change: on_rf_node_change,
    on_edge_change: on_rf_edge_change,
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
    iterf.useReactFlowStore.getState().update_nodes([]);
    iterf.useReactFlowStore.getState().update_edges([]);
    iterf.auto_progress();
  };

  const center_node = (node_id: string | string[]) => {
    if (!iterf.rf_instance) {
      return;
    }
    node_id = Array.isArray(node_id) ? node_id : [node_id];

    const nodes = iterf.useReactFlowStore
      .getState()
      .getNodes()
      .filter((node) => node_id.includes(node.id));

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
      selected_groups: [],
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
    on_group_action: on_group_action,
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

export { FuncNodesReactFlowZustand };
export { LibZustand, NodeSpaceZustand, assert_reactflow_node };
