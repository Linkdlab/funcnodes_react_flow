import { StoreApi, UseBoundStore } from "zustand";
import { LimitedDeepPartial } from "../../../utils/objects";
import { IOStore, PartialSerializedIOType, SerializedIOType } from "./io.t";
import { TqdmState } from "../../../frontend/utils/progressbar";
import { v0 as v0_types } from "../../../types/versioned/versions.t";

export * from "../v0/node.t";

export interface NodeProperties {
  "frontend:size": [number, number];
  "frontend:pos": [number, number];
  "frontend:collapsed": boolean;
  // allow for any other properties
  [key: string]: any | undefined;
}

export interface NodeActionUpdate extends v0_types.BaseNodeAction {
  type: "update";
  node: PartialSerializedNodeType;
}

export interface NodeActionAdd extends v0_types.BaseNodeAction {
  type: "add";
  node: SerializedNodeType;
}

export type NodeAction =
  | NodeActionAdd
  | NodeActionUpdate
  | v0_types.NodeActionDelete
  | v0_types.NodeActionError
  | v0_types.NodeActionTrigger;

export type PartialSerializedNodeType = LimitedDeepPartial<SerializedNodeType>;

export interface BasicNodeType {
  id: string;
  node_id: string;
  node_name: string;
  name: string;
  error?: string;
  render_options?: v0_types.NodeRenderOptions;
  description?: string;
  properties: NodeProperties;
  status?: { [key: string]: any | undefined };
}

export type SerializedNodeIOMappingType = {
  [key: string]: SerializedIOType | undefined;
};
export type PartialSerializedNodeIOMappingType = {
  [key: string]: PartialSerializedIOType | undefined;
};

export interface SerializedNodeType extends BasicNodeType {
  in_trigger: boolean;
  io: SerializedNodeIOMappingType;
  io_order?: string[];
  progress: TqdmState;
}

export interface NodeType extends Omit<BasicNodeType, "in_trigger" | "io"> {
  in_trigger: UseBoundStore<StoreApi<boolean>>;
  io: { [key: string]: IOStore | undefined };
  inputs: string[];
  outputs: string[];
  io_order: string[];
  progress: UseBoundStore<StoreApi<TqdmState>>;
}

export interface NodeStore {
  _state: UseBoundStore<StoreApi<NodeType>>;
  use: () => NodeType;
  getState: () => NodeType;
  setState: (new_state: Partial<NodeType>) => void;
  update: (new_state: PartialSerializedNodeType) => void;
  serialize: () => SerializedNodeType;
}
