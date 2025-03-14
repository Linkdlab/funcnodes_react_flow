import { UseBoundStore, StoreApi } from "zustand";
import { IOStore, PartialSerializedIOType, SerializedIOType } from "./nodeio.t";
import { DataRenderOptions } from "../types/rendering.t";
import { TqdmState } from "../frontend/utils/progressbar";
import { LimitedDeepPartial } from "../utils/objects";

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
  node: SerializedNodeType;
}

/**
 * Interface for the NodeActionUpdate.
 * This interface is used when an existing node is being updated.
 * It has a type property set to "update", an id property for the node to be updated,
 * and a node property of PartialNodeType which contains the properties to be updated.
 */
interface NodeActionUpdate extends BaseNodeAction {
  type: "update";
  node: PartialSerializedNodeType;
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
  tb?: string;
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

interface NodeStore {
  _state: UseBoundStore<StoreApi<NodeType>>;
  use: () => NodeType;
  getState: () => NodeType;
  setState: (new_state: Partial<NodeType>) => void;
  update: (new_state: PartialSerializedNodeType) => void;
}

interface NodeRenderOptions {
  data?: DataRenderOptions;
}

interface NodeProperties {
  "frontend:size": [number, number];
  "frontend:pos": [number, number];
  "frontend:collapsed": boolean;
  // allow for any other properties
  [key: string]: any;
}

type SerializedNodeIOMappingType = { [key: string]: SerializedIOType };
type PartialSerializedNodeIOMappingType = {
  [key: string]: PartialSerializedIOType;
};

interface BasicNodeType {
  id: string;
  node_id: string;
  node_name: string;
  name: string;
  error?: string;
  render_options?: NodeRenderOptions;
  description?: string;
  properties: NodeProperties;
  status?: { [key: string]: any };
}

interface SerializedNodeType extends BasicNodeType {
  in_trigger: boolean;
  io: SerializedNodeIOMappingType;
  io_order?: string[];
  progress: TqdmState;
}

interface NodeType extends Omit<BasicNodeType, "in_trigger" | "io"> {
  in_trigger: UseBoundStore<StoreApi<boolean>>;
  io: { [key: string]: IOStore };
  inputs: string[];
  outputs: string[];
  io_order: string[];
  progress: UseBoundStore<StoreApi<TqdmState>>;
}

type PartialSerializedNodeType = LimitedDeepPartial<SerializedNodeType>;

export type {
  NodeStore,
  NodeAction,
  NodeActionUpdate,
  NodeActionDelete,
  NodeActionAdd,
  NodeActionError,
  NodeActionTrigger,
  NodeType,
  NodeProperties,
  SerializedNodeType,
  PartialSerializedNodeType,
  SerializedNodeIOMappingType,
  PartialSerializedNodeIOMappingType,
};
