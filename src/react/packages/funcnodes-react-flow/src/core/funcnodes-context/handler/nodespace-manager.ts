import {
  EdgeAction,
  GroupAction,
  GroupActionUpdate,
  NodeAction,
  NodeActionAdd,
  NodeActionDelete,
  NodeActionError,
  NodeActionTrigger,
  NodeActionUpdate,
} from "../actions";
import {
  AbstractFuncNodesReactFlowHandleHandler,
  FuncNodesReactFlowHandlerContext,
} from "./rf-handlers.types";

import type { AnyFuncNodesRFNode, GroupRFNode } from "@/nodes";
import {
  applyNodeChanges,
  Edge,
  NodeDimensionChange,
  NodePositionChange,
} from "@xyflow/react";

import { deep_merge } from "@/object-helpers";
import { NodeGroups } from "@/groups";

import {
  createNodeStore,
  NodeType,
  sortByParent,
  split_rf_nodes,
} from "@/nodes-core";
import { generate_edge_id } from "@/edges-core";
import { assert_reactflow_node } from "@/react-flow";
import { NodeSpaceZustand, NodeSpaceZustandInterface } from "@/nodespace";

export interface NodeSpaceManagerAPI {
  on_node_action: (action: NodeAction) => NodeType | undefined;
  on_edge_action: (edge: EdgeAction) => void;
  on_group_action: (group: GroupAction) => void;
  clear_all: () => void;
  center_node: (node_id: string | string[]) => void;
  center_all: () => void;
}

export class NodeSpaceManager
  extends AbstractFuncNodesReactFlowHandleHandler
  implements NodeSpaceManagerAPI
{
  public nodespace: NodeSpaceZustandInterface;
  constructor(context: FuncNodesReactFlowHandlerContext) {
    super(context);
    this.nodespace = NodeSpaceZustand({});
  }
  on_node_action = (action: NodeAction): NodeType | undefined => {
    switch (action.type) {
      case "add":
        return this._add_node(action);
      case "update":
        return this._update_node(action);
      case "delete":
        return this._delete_node(action);
      case "error":
        return this._error_action(action);
      case "trigger":
        return this._trigger_action(action);
      default:
        this.context.rf.logger.error("Unknown node action", action);
        return undefined;
    }
  };
  on_edge_action = (action: EdgeAction) => {
    const rfstate = this.reactFlowManager.useReactFlowStore.getState();

    switch (action.type) {
      case "add":
        if (action.from_remote) {
          const edges = rfstate.getEdges();
          const new_edge_id = generate_edge_id(action);

          //cehck if edge already exists including reversed
          if (edges.some((e) => e.id === new_edge_id)) {
            return;
          }
          const new_edge: Edge = {
            id: new_edge_id,
            source: action.src_nid,
            target: action.trg_nid,
            sourceHandle: action.src_ioid,
            targetHandle: action.trg_ioid,
            className: "funcnodes-edge animated",
            zIndex: 1003, // just above elevated groups
          };

          this.context.rf.logger.info("Adding edge", new_edge);

          rfstate.update_edges([...edges, new_edge]);
          this.workerManager.worker?.api.node.get_remote_node_state(
            action.src_nid
          );
          this.workerManager.worker?.api.node.get_remote_node_state(
            action.trg_nid
          );
        } else {
        }
        break;

      case "delete":
        if (action.from_remote) {
          const edges = rfstate.getEdges();
          const del_edge_id = generate_edge_id(action);
          this.context.rf.logger.info("Deleting edge", del_edge_id);
          const new_edges = edges.filter((edge) => edge.id !== del_edge_id);
          rfstate.update_edges(new_edges);
          this.workerManager.worker?.api.node.get_remote_node_state(
            action.src_nid
          );
          this.workerManager.worker?.api.node.get_remote_node_state(
            action.trg_nid
          );
        } else {
        }
        break;
      default:
        this.context.rf.logger.error("Unknown edge action", action);
    }
  };
  on_group_action = (action: GroupAction) => {
    switch (action.type) {
      case "set":
        return this._set_groups(action.groups);
      case "update":
        return this._update_group(action);
      default:
        this.context.rf.logger.error("Unknown group action", action);
    }
  };
  clear_all = () => {
    this.context.rf.logger.debug("Clearing all nodespace");
    this.workerManager.worker?.disconnect();
    this.workerManager.set_worker(undefined);
    this.workerManager.workermanager?.setWorker(undefined);
    this.libManager.lib.libstate
      .getState()
      .set({ lib: { shelves: [] }, external_worker: [] });
    this.nodespace.nodesstates.clear();
    this.reactFlowManager.useReactFlowStore.getState().update_nodes([]);
    this.reactFlowManager.useReactFlowStore.getState().update_edges([]);
    this.stateManager.auto_progress();
  };
  center_node = (node_id: string | string[]) => {
    if (!this.reactFlowManager.rf_instance) {
      return;
    }
    node_id = Array.isArray(node_id) ? node_id : [node_id];

    const nodes = this.reactFlowManager.useReactFlowStore
      .getState()
      .getNodes()
      .filter((node) => node_id.includes(node.id));

    if (nodes.length > 0) {
      this.reactFlowManager.rf_instance?.fitView({ padding: 0.2, nodes });
    }
  };
  center_all() {
    this.reactFlowManager.rf_instance?.fitView({ padding: 0.2 });
  }

  auto_resize_group = (gid: string) => {
    const rfstate = this.reactFlowManager.useReactFlowStore.getState();
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

    const bounds = this.reactFlowManager.rf_instance?.getNodesBounds(all_nodes);
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
  };
  change_group_position = (change: NodePositionChange) => {
    if (change.position === undefined) {
      return;
    }
    const rfstate = this.reactFlowManager.useReactFlowStore.getState();

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
    const bounds =
      this.reactFlowManager.rf_instance?.getNodesBounds(child_node_ids);
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
  change_fn_node_position = (change: NodePositionChange) => {
    if (change.position === undefined) {
      return;
    }
    this.on_node_action({
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
  change_group_dimensions = (change: NodeDimensionChange) => {
    if (change.dimensions === undefined) {
      return;
    }
    const rfstate = this.reactFlowManager.useReactFlowStore.getState();
    const group = rfstate.getNode(change.id);
    if (group === undefined) {
      return;
    }

    this.reactFlowManager.useReactFlowStore
      .getState()
      .partial_update_nodes(applyNodeChanges([change], [group]));
  };
  change_fn_node_dimensions = (change: NodeDimensionChange) => {
    if (change.dimensions === undefined) {
      return;
    }
    this.on_node_action({
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

  _update_group = (action: GroupActionUpdate) => {
    if (action.from_remote) {
      const rfstate = this.reactFlowManager.useReactFlowStore.getState();
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
      if (this.workerManager.worker) {
        this.workerManager.worker.api.group.locally_update_group(action);
      }
    }
  };

  _set_groups = (groups: NodeGroups) => {
    const rfstate = this.reactFlowManager.useReactFlowStore.getState();
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
        this.auto_resize_group(node.id);
      }
    }
  };
  _add_node = (action: NodeActionAdd): NodeType | undefined => {
    this.context.rf.logger.info("add node", action);
    const rfstate = this.reactFlowManager.useReactFlowStore.getState();
    if (action.from_remote) {
      let store = this.nodespace.get_node(action.node.id, false);
      if (store) {
        return undefined;
      }
      if (!store) {
        try {
          store = createNodeStore(action.node);
          this.nodespace.nodesstates.set(action.node.id, store);
        } catch (e) {
          this.context.rf.logger.error(`Failed to create node store ${e}`);
          return undefined;
        }
      }

      const node = store!.getState();

      this.context.rf.logger.info("Add node", node.id, node.name);
      const new_node = assert_reactflow_node(store, this.context.rf);
      const new_ndoes = [...rfstate.getNodes(), new_node];
      this.reactFlowManager.useReactFlowStore
        .getState()
        .update_nodes(new_ndoes);

      for (const io of new_node.io_order) {
        this.workerManager.worker?.api.node.get_io_value({
          nid: new_node.id,
          ioid: io,
        });
      }

      setTimeout(() => {
        this.workerManager.worker?.api.hooks.call_hooks("node_added", {
          node: node.id,
        });
      }, 0);
      return node;
    }
    return undefined;
  };

  _update_node = (action: NodeActionUpdate): NodeType | undefined => {
    // some action reset the error, so far trigger does, so errors should remove the in_trigger flag
    if (Object.keys(action.node).length === 0) {
      this.context.rf.logger.error(
        "Node update is empty",
        new Error(JSON.stringify(action))
      );
      return undefined;
    }
    if (action.node.in_trigger) {
      action.node.error = undefined;
    }
    if (action.from_remote) {
      const store = this.nodespace.get_node(action.id, false);
      if (!store) {
        console.error("Node not found to update", action.id);
        return undefined;
      }

      store.update(action.node);
      return store.getState();
    } else {
      if (this.workerManager.worker) {
        this.workerManager.worker.api.node.locally_update_node(action);
      }
    }
    return undefined;
  };

  /**
   * Sync the nodes between the nodespace and the react zustand
   * This is needed because e.g. deleting a node removes it from the react zustand but the nodespace still has it
   * so we need to sync the nodes between the two
   */
  _sync_nodes = () => {
    const rf_nodes = this.reactFlowManager.useReactFlowStore
      .getState()
      .getNodes();
    const nodespace_nodes = this.nodespace.nodesstates;
    for (const nodeid of nodespace_nodes.keys()) {
      if (rf_nodes.some((node) => node.id === nodeid)) {
        continue;
      }
      nodespace_nodes.delete(nodeid);
    }
  };

  _delete_node = (action: NodeActionDelete) => {
    this.context.rf.logger.info("Deleting node", action.id);
    if (action.from_remote) {
      this.reactFlowManager.useReactFlowStore.getState().onNodesChange([
        {
          type: "remove",
          id: action.id,
        },
      ]);
      this._sync_nodes(); // deleteing a node removes it from the react zustand but the nodespace still has it
    } else {
      this.workerManager.worker?.api.node.remove_node(action.id);
    }
    return undefined;
  };

  _error_action = (action: NodeActionError) => {
    this.context.rf.logger.error("Error", new Error(JSON.stringify(action)));
    return this.on_node_action({
      type: "update",
      id: action.id,
      node: {
        in_trigger: false,
        error: action.error,
      },
      from_remote: true,
    });
  };

  _trigger_action = (action: NodeActionTrigger) => {
    if (action.from_remote) {
      return this.on_node_action({
        type: "update",
        id: action.id,
        node: {
          in_trigger: true,
          error: undefined,
        },
        from_remote: true,
      });
    } else {
      this.workerManager.worker?.api.node.trigger_node(action.id);
    }
    return undefined;
  };
}
