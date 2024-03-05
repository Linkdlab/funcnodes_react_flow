import { useStore, create, UseBoundStore, StoreApi } from "zustand";
import { DeepPartial, deep_merge } from "./";
import {
  BaseRenderOptions,
  RenderOptions,
  RenderType,
} from "../frontend/datarenderer";

interface IORenderOptions extends BaseRenderOptions {
  step?: number;
  set_default?: boolean;
}

interface IOValueOptions {
  min?: number;
  max?: number;
  step?: number;
  options?: (string | number)[];
  colorspace?: string;
}
interface IOType {
  connected: boolean;
  does_trigger: boolean;
  full_id: string;
  id: string;
  is_input: boolean;
  name: string;
  node: string;
  type: string;
  value: any;
  render_options?: IORenderOptions;
  value_options?: IOValueOptions;
  valuepreview_type?: string;
}

type PartialIOType = DeepPartial<IOType>;

interface DataRenderOptions extends BaseRenderOptions {
  src?: string;
  type?: RenderType;
  preview_type?: string;
}

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
}

type PartialNodeType = DeepPartial<NodeType>;
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

interface NodeTrigger extends BaseNodeAction {
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
  | NodeTrigger;

type NodeStore = UseBoundStore<StoreApi<NodeType>>;

const dummy_node: NodeType = {
  id: "dummy",
  node_name: "dummy",
  frontend: {
    pos: [0, 0],
    size: [200, 100],
    collapsed: false,
  },
  io: {},
  name: "dummy",
  in_trigger: false,
};
const assert_full_node = (node: PartialNodeType): NodeType => {
  if (!node.id) {
    throw new Error("Node must have an id");
  }

  const { new_obj } = deep_merge(dummy_node, node);
  return new_obj;
};

const createNodeStore = (node: NodeType): NodeStore => {
  return create<NodeType>((set, get) => node);
};
export { createNodeStore, assert_full_node };

export type {
  NodeType,
  NodeStore,
  NodeAction,
  PartialNodeType,
  IOType,
  NodeActionUpdate,
  NodeActionDelete,
  NodeActionAdd,
  NodeActionError,
  PartialIOType,
  RenderType,
};
