import { IOStore } from "./io";
import { TqdmState } from "@/shared-components";
import { BaseRenderOptions } from "./rendering";
import {
  PartialSerializedNodeType,
  SerializedNodeType,
} from "../serializations";
import { DeepPartial } from "@/object-helpers";
import { UseJSONStore } from "@/zustand-helpers";

export interface NodeProperties {
  "frontend:size": [number, number];
  "frontend:pos": [number, number];
  "frontend:collapsed": boolean;
  // allow for any other properties
  [key: string]: any | undefined;
}

export interface DataRenderOptions extends BaseRenderOptions {
  src?: string;
  preview_type?: string;
}

export interface NodeRenderOptions {
  data?: DataRenderOptions;
}

export interface BasicNodeType {
  id: string;
  node_id: string;
  node_name: string;
  name: string;
  error?: string;
  render_options?: DeepPartial<NodeRenderOptions>;
  description?: string;
  properties: NodeProperties;
  reset_inputs_on_trigger: boolean;
  status?: { [key: string]: any | undefined };
}

export interface NodeType extends Omit<BasicNodeType, "in_trigger" | "io"> {
  in_trigger: boolean;
  inputs: string[];
  outputs: string[];
  io_order: string[];
  progress: DeepPartial<TqdmState>;
  [key: string]: any;
}

export interface NodeStore {
  node_state: UseJSONStore<NodeType>;
  io_stores: Map<string, IOStore>;
  use(): NodeType;
  use<U>(selector: (state: NodeType) => U): U;
  useShallow<U>(selector: (state: NodeType) => U): U;
  getState: () => NodeType;
  setState: (new_state: Partial<NodeType>) => void;
  update: (new_state: PartialSerializedNodeType) => void;
  serialize: () => SerializedNodeType;
}
