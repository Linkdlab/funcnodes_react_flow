import * as React from "react";
import RendererPlugin from "./renderer";
import { FuncNodesReactFlowZustandInterface } from "../states/fnrfzst.t";

type RenderPluginFactoryProps = {
  React: typeof React;
  fnrf_zst: FuncNodesReactFlowZustandInterface;
};

interface FuncNodesReactPlugin {
  RendererPlugin?: RendererPlugin;
  renderpluginfactory?: (props: RenderPluginFactoryProps) => RendererPlugin;
}

interface PackedPlugin {
  module: string;
  js?: string[];
  css?: string[];
}

export type { RendererPlugin, PackedPlugin, RenderPluginFactoryProps };
export default FuncNodesReactPlugin;
