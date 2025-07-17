import { UseBoundStore, StoreApi } from "zustand";
import { DataRenderOptions } from "./rendering.t";
import { DeepPartial } from "@/object-helpers";

import { IOType } from "./io.t";
import { TqdmState } from "../../../frontend/utils/progressbar";

/**
 * Interface for the NodeActionAdd.
 * This interface is used when a new node is being added.
 * It has a type property set to "add" and a node property of NodeType.
 */
export interface BaseNodeAction {
  type: string;
  from_remote: boolean;
  id: string;
  immediate?: boolean;
}
export interface NodeActionAdd extends BaseNodeAction {
  type: "add";
  node: NodeType;
}
/**
 * Interface for the NodeActionUpdate.
 * This interface is used when an existing node is being updated.
 * It has a type property set to "update", an id property for the node to be updated,
 * and a node property of PartialNodeType which contains the properties to be updated.
 */
export interface NodeActionUpdate extends BaseNodeAction {
  type: "update";
  node: PartialNodeType;
}
/**
 * Interface for the NodeActionDelete.
 * This interface is used when a node is being deleted.
 * It has a type property set to "delete" and an id property for the node to be deleted.
 */
export interface NodeActionDelete extends BaseNodeAction {
  type: "delete";
}
export interface NodeActionError extends BaseNodeAction {
  type: "error";
  errortype: string;
  error: string;
  tb?: string;
}

export interface NodeActionTrigger extends BaseNodeAction {
  type: "trigger";
}
/**
 * Type alias for NodeAction.
 * A NodeAction can be either a NodeActionAdd, NodeActionUpdate, or NodeActionDelete.
 */
export type NodeAction =
  | NodeActionAdd
  | NodeActionUpdate
  | NodeActionDelete
  | NodeActionError
  | NodeActionTrigger;
export type NodeStore = UseBoundStore<StoreApi<NodeType>>;
export interface NodeRenderOptions {
  data?: DataRenderOptions;
}
export interface NodeType {
  id: string;
  node_name: string;
  io: {
    [key: string]: IOType | undefined;
  };
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
  progress: TqdmState;
}
export type PartialNodeType = DeepPartial<NodeType>;
