import {
  DataOverlayRendererType,
  DataPreviewViewRendererType,
  DataViewRendererType,
  HandlePreviewRendererType,
  InputRendererType,
  NodeHooksType,
  NodeRendererType,
  OutputRendererType,
} from "@/data-rendering-types";
import { NodeContext } from "@/nodes";
import { FuncNodesReactFlow } from "@/funcnodes-context";
import * as React from "react";
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
  node_hooks?: { [key: string]: NodeHooksType[] | undefined };
}
export type RenderPluginFactoryProps = {
  React?: typeof React;
  fnrf_zst?: FuncNodesReactFlow;
  NodeContext?: typeof NodeContext;
};

export interface PackedPlugin {
  module: string;
  js?: string[];
  css?: string[];
}

export interface FuncNodesReactPlugin<V extends string = string> {
  renderpluginfactory?: (props: RenderPluginFactoryProps) => RendererPlugin;
  v: V;
}
