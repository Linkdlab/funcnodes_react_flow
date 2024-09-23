import { BaseRenderOptions } from "../types/rendering.t";
import { DeepPartial } from "../utils";
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
  step?: number;
  set_default: boolean;
}

interface IOValueOptions {
  min?: number;
  max?: number;
  step?: number;
  options?: (string | number)[] | EnumOf;
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
  type: SerializedType;
  value: any;
  fullvalue?: any;
  render_options: IORenderOptions;
  value_options?: IOValueOptions;
  valuepreview_type?: string;
  try_get_full_value: undefined | (() => void);
  hidden: boolean;
  set_hidden: undefined | ((v: boolean) => void);
}

interface UpdateableIOOptions {
  name?: string;
  hidden?: boolean;
}

type OutputRendererType = ({ io }: { io: IOType }) => JSX.Element;

interface InputRendererProps {
  io: IOType;
  inputconverter: [(v: any) => any, (v: any) => any];
}
type InputRendererType = ({
  io,
  inputconverter,
}: InputRendererProps) => JSX.Element;

type PartialIOType = DeepPartial<IOType>;

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
  OutputRendererType,
  InputRendererProps,
  InputRendererType,
  PartialIOType,
  UpdateableIOOptions,
};
