import { JSX } from "react";
import { BaseRenderOptions } from "../types/rendering.t";
import { LimitedDeepPartial } from "../utils/objects";
import { UseBoundStore, StoreApi } from "zustand";
import { NodeStore } from "./node.t";
interface AllOf {
  allOf: SerializedType[];
}

interface AnyOf {
  anyOf: SerializedType[];
}

interface ArrayOf {
  type: "array";
  items: SerializedType;
  uniqueItems: boolean;
}

interface DictOf {
  type: "object";
  keys: SerializedType;
  values: SerializedType;
}

interface EnumOf {
  type: "enum";
  values: (number | string | boolean | null)[];
  keys: string[];
  nullable: boolean;
}

interface TypeOf {
  type: "type";
  value: SerializedType;
}

// SerializedType represents a union of different possible types.
type SerializedType =
  | string
  | AllOf
  | AnyOf
  | ArrayOf
  | DictOf
  | EnumOf
  | TypeOf;

interface IORenderOptions extends BaseRenderOptions {
  set_default: boolean;
}

interface IOValueOptions {
  min?: number;
  max?: number;
  step?: number;
  options?: (string | number)[] | EnumOf;
  colorspace?: string;
}

interface BasicIOType {
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
}

interface SerializedIOType extends BasicIOType {
  value: any;
  fullvalue: any;
}
interface IOType extends BasicIOType {
  try_get_full_value: () => void;
  set_hidden: (v: boolean) => void;
}

type PartialSerializedIOType = LimitedDeepPartial<SerializedIOType>;

interface ValueStoreInterface {
  preview: any;
  full: any;
}
interface IOStore {
  _state: UseBoundStore<StoreApi<IOType>>;
  use: () => IOType;
  getState: () => IOType;
  setState: (new_state: Partial<IOType>) => void;
  update: (new_state: PartialSerializedIOType) => void;
  valuestore: UseBoundStore<StoreApi<ValueStoreInterface>>;
  node: NodeStore;
}

interface UpdateableIOOptions {
  name?: string;
  hidden?: boolean;
}

type OutputRendererProps = { io: IOType };

type OutputRendererType = ({ io }: OutputRendererProps) => JSX.Element;

interface InputRendererProps {
  iostore: IOStore;
  inputconverter: [(v: any) => any, (v: any) => any];
}
type InputRendererType = ({
  iostore,
  inputconverter,
}: InputRendererProps) => JSX.Element;

export type {
  AllOf,
  AnyOf,
  ArrayOf,
  DictOf,
  EnumOf,
  TypeOf,
  SerializedType,
  IORenderOptions,
  IOValueOptions,
  IOType,
  OutputRendererProps,
  OutputRendererType,
  InputRendererProps,
  InputRendererType,
  PartialSerializedIOType,
  UpdateableIOOptions,
  SerializedIOType,
  IOStore,
  ValueStoreInterface,
};
