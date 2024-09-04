import { UseBoundStore, StoreApi } from "zustand";
import { DeepPartial } from "../utils";
import { IOType } from "./nodeio.t";
import { DataRenderOptions } from "../types/rendering.t";

/**
 * Interface for the NodeActionAdd.
 * This interface is used when a new node is being added.
 * It has a type property set to "add" and a node property of NodeType.
 */

interface BaseNodeAction {
  type: string;
  from_remote: boolean;
  id: string;
  immediate?: boolean;
}

interface NodeActionAdd extends BaseNodeAction {
  type: "add";
  node: NodeType;
}

/**
 * Interface for the NodeActionUpdate.
 * This interface is used when an existing node is being updated.
 * It has a type property set to "update", an id property for the node to be updated,
 * and a node property of PartialNodeType which contains the properties to be updated.
 */
interface NodeActionUpdate extends BaseNodeAction {
  type: "update";
  node: PartialNodeType;
}

/**
 * Interface for the NodeActionDelete.
 * This interface is used when a node is being deleted.
 * It has a type property set to "delete" and an id property for the node to be deleted.
 */
interface NodeActionDelete extends BaseNodeAction {
  type: "delete";
}

interface NodeActionError extends BaseNodeAction {
  type: "error";
  errortype: string;
  error: string;
}

interface NodeActionTrigger extends BaseNodeAction {
  type: "trigger";
}

/**
 * Type alias for NodeAction.
 * A NodeAction can be either a NodeActionAdd, NodeActionUpdate, or NodeActionDelete.
 */
type NodeAction =
  | NodeActionAdd
  | NodeActionUpdate
  | NodeActionDelete
  | NodeActionError
  | NodeActionTrigger;

type NodeStore = UseBoundStore<StoreApi<NodeType>>;

interface NodeRenderOptions {
  data?: DataRenderOptions;
}

interface NodeType {
  id: string;
  node_name: string;
  io: { [key: string]: IOType };
  frontend: {
    pos: [number, number];
    size: [number, number];
    collapsed: boolean;
  };
  name: string;
  in_trigger: boolean;
  error?: string;
  render_options?: NodeRenderOptions;
  io_order: string[];
}

type PartialNodeType = DeepPartial<NodeType>;

export type {
  NodeStore,
  NodeAction,
  NodeActionUpdate,
  NodeActionDelete,
  NodeActionAdd,
  NodeActionError,
  PartialNodeType,
  NodeActionTrigger,
  NodeType,
};
