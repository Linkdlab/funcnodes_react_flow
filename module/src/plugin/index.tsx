import * as React from "react";
import RendererPlugin from "./renderer";
import { NodeContextType } from "../frontend/node/node";
import { FuncNodesReactFlowZustandInterface } from "../states/fnrfzst.t";

type RenderPluginFactoryProps = {
  React: typeof React;
  fnrf_zst: FuncNodesReactFlowZustandInterface;
  NodeContext: React.Context<NodeContextType | null>;
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
