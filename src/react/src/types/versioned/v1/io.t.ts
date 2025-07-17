import { UseBoundStore, StoreApi } from "zustand";
import { LimitedDeepPartial } from "@/object-helpers";
import { IORenderOptions, IOValueOptions } from "../v0/io.t";
import { SerializedType } from "./rendering.t";
import { NodeStore } from "./node.t";
import { DataStructure } from "../../../funcnodes/datastructures";

export * from "../v0/io.t";

export interface ValueStoreInterface {
  preview: DataStructure<any, any> | undefined;
  full: DataStructure<any, any> | undefined;
}

export interface IOStore {
  _state: UseBoundStore<StoreApi<IOType>>;
  use: () => IOType;
  getState: () => IOType;
  setState: (new_state: Partial<IOType>) => void;
  update: (new_state: PartialSerializedIOType) => void;
  valuestore: UseBoundStore<StoreApi<ValueStoreInterface>>;
  node: NodeStore;
  updateValueStore: (newData: Partial<ValueStoreInterface>) => void;
  serialize: () => SerializedIOType;
}

export interface BasicIOType {
  connected: boolean;
  does_trigger: boolean;
  full_id: string;
  id: string;
  is_input: boolean;
  name: string;
  node: string;
  type: SerializedType;
  render_options: IORenderOptions;
  value_options?: IOValueOptions;
  valuepreview_type?: string;
  hidden: boolean;
  emit_value_set: boolean;
  default?: any;
  required: boolean;
}

export interface SerializedIOType extends BasicIOType {
  value: string | number | boolean | undefined | DataStructure<any, any>;
  fullvalue: string | number | boolean | undefined | DataStructure<any, any>;
}
export interface IOType extends BasicIOType {
  try_get_full_value: () => void;
  set_hidden: (v: boolean) => void;
}

export type PartialSerializedIOType = LimitedDeepPartial<SerializedIOType>;

export interface UpdateableIOOptions {
  name?: string;
  hidden?: boolean;
}
