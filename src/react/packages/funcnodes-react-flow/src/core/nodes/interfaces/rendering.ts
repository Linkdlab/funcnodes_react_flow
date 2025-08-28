import { SerializedType } from "../serializations";

export type RenderType =
  | "string"
  | "number"
  | "boolean"
  | "image"
  | "any"
  | SerializedType;

export interface BaseRenderOptions {
  type: RenderType;
}
