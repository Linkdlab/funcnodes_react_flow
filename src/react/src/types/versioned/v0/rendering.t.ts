export interface AllOf {
  allOf: SerializedType[];
}
export interface AnyOf {
  anyOf: SerializedType[];
}
export interface ArrayOf {
  type: "array";
  items: SerializedType;
  uniqueItems: boolean;
}
export interface DictOf {
  type: "object";
  keys: SerializedType;
  values: SerializedType;
}
export interface EnumOf {
  type: "enum";
  values: (number | string | boolean | null)[];
  keys: string[];
  nullable: boolean;
}
export interface TypeOf {
  type: "type";
  value: SerializedType;
}
export type SerializedType =
  | string
  | AllOf
  | AnyOf
  | ArrayOf
  | DictOf
  | EnumOf
  | TypeOf;

export type RenderType =
  | "string"
  | "number"
  | "boolean"
  | "image"
  | SerializedType;

export interface BaseRenderOptions {
  type: RenderType;
}
export interface DataRenderOptions extends BaseRenderOptions {
  src?: string;
  preview_type?: string;
}

export interface StringRenderOptions extends BaseRenderOptions {
  max_length?: number;
}

export interface ImageRenderOptions extends BaseRenderOptions {
  format?: "png" | "jpeg";
}

export type RenderOptions =
  | BaseRenderOptions
  | ImageRenderOptions
  | StringRenderOptions;
