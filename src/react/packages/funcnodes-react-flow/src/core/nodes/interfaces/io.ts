import { AnyDataType, DataStructure, JSONType } from "@/data-structures";
import {
  EnumOf,
  PartialSerializedIOType,
  SerializedIOType,
  SerializedType,
} from "../serializations";
import { BaseRenderOptions } from "./rendering";
import { UseBoundStore, StoreApi } from "zustand";
import { UseJSONStore } from "@/zustand-helpers";
import { RJSFSchema, UiSchema } from "@rjsf/utils";

export interface IORenderOptions extends BaseRenderOptions {
  set_default: boolean;
  schema?: RJSFSchema;
  uiSchema?: UiSchema;
}

export interface IOValueOptions {
  min?: number;
  max?: number;
  step?: number;
  options?: (string | number)[] | EnumOf;
  colorspace?: string;
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

export interface IOType extends BasicIOType {
  [key: string]: any | undefined;
}

export interface ValueStoreInterface {
  preview: DataStructure<AnyDataType, JSONType | undefined> | undefined;
  full: DataStructure<AnyDataType, JSONType | undefined> | undefined;
}

export interface IOStore {
  io_state: UseJSONStore<IOType>;
  use(): IOType;
  use<U>(selector: (state: IOType) => U): U;
  useShallow<U>(selector: (state: IOType) => U): U;
  getState: () => IOType;
  setState: (new_state: Partial<IOType>) => void;
  update: (new_state: PartialSerializedIOType) => void;
  valuestore: UseBoundStore<StoreApi<ValueStoreInterface>>;
  node: string;
  updateValueStore: (newData: Partial<ValueStoreInterface>) => void;
  serialize: () => SerializedIOType;
}

export interface UpdateableIOOptions {
  name?: string;
  hidden?: boolean;
}
