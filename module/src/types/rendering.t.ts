import { SerializedType } from "../states/nodeio.t";

type RenderType = "string" | "number" | "boolean" | "image" | SerializedType;

interface BaseRenderOptions {
  type: RenderType;
}

interface DataRenderOptions extends BaseRenderOptions {
  src?: string;
  preview_type?: string;
}

export type { DataRenderOptions, RenderType, BaseRenderOptions };
