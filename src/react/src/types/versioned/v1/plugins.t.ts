import {
  DataOverlayRendererType,
  DataPreviewViewRendererType,
  DataViewRendererType,
  HandlePreviewRendererType,
  InputRendererType,
  OutputRendererType,
} from "@/data-rendering";
import {
  RenderPluginFactoryProps,
  FuncNodesReactPlugin as FuncNodesReactPlugin_v0,
  RendererPlugin as RendererPlugin_v0,
  RenderPluginFactoryProps as RenderPluginFactoryProps_v0,
} from "../v0/plugins.t";
import {
  NodeContextExtenderType,
  NodeHooksType,
  NodeRendererType,
} from "./rendermappings.t";
export * from "../v0/plugins.t";

export interface RendererPlugin {
  input_renderers?: { [key: string]: InputRendererType | undefined };
  output_renderers?: { [key: string]: OutputRendererType | undefined };
  handle_preview_renderers?: {
    [key: string]: HandlePreviewRendererType | undefined;
  };
  data_overlay_renderers?: {
    [key: string]: DataOverlayRendererType | undefined;
  };
  data_preview_renderers?: {
    [key: string]: DataPreviewViewRendererType | undefined;
  };
  data_view_renderers?: { [key: string]: DataViewRendererType | undefined };
  node_renderers?: { [key: string]: NodeRendererType | undefined };
  node_context_extenders?: {
    [key: string]: NodeContextExtenderType | undefined;
  };
  node_hooks?: { [key: string]: NodeHooksType[] | undefined };
}

export interface FuncNodesReactPlugin {
  renderpluginfactory?: (props: RenderPluginFactoryProps) => RendererPlugin;
  v: 1 | "1";
}

export type AnyFuncNodesReactPlugin =
  | FuncNodesReactPlugin_v0
  | FuncNodesReactPlugin;

export type AnyRendererPlugin = RendererPlugin_v0 | RendererPlugin;

export type AnyRenderPluginFactoryProps =
  | RenderPluginFactoryProps_v0
  | RenderPluginFactoryProps;
