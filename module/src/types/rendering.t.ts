type RenderType = "string" | "number" | "boolean" | "image";

interface BaseRenderOptions {
  type?: RenderType;
}

interface DataRenderOptions extends BaseRenderOptions {
  src?: string;
  type?: RenderType;
  preview_type?: string;
}

export type { DataRenderOptions, RenderType, BaseRenderOptions };
