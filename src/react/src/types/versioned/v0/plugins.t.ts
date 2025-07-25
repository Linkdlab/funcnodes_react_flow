import * as React from "react";
import { FuncNodesReactFlowZustandInterface } from "@/barrel_imports";
import { NodeContextType } from "@/barrel_imports";
import {
  DataOverlayRendererType,
  DataPreviewViewRendererType,
  DataViewRendererType,
  HandlePreviewRendererType,
  InputRendererType,
  OutputRendererType,
} from "./rendermappings.t";

export type RenderPluginFactoryProps = {
  React: typeof React;
  fnrf_zst: FuncNodesReactFlowZustandInterface;
  NodeContext: React.Context<NodeContextType | null>;
};

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
}

export interface FuncNodesReactPlugin {
  RendererPlugin?: RendererPlugin;
  renderpluginfactory?: (props: RenderPluginFactoryProps) => RendererPlugin;
  v?: 0 | "0";
}

export type AnyFuncNodesReactPlugin = FuncNodesReactPlugin;

export type AnyRendererPlugin = RendererPlugin;

export type AnyRenderPluginFactoryProps = RenderPluginFactoryProps;
