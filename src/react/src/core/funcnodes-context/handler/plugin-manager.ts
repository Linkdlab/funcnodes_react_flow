import {
  AbstractFuncNodesReactFlowHandleHandler,
  FuncNodesReactFlowHandlerContext,
} from "./rf-handlers.types";
import { UseBoundStore, StoreApi, create } from "zustand";
import { RenderOptions } from "@/data-rendering-types";
import { update_zustand_store } from "@/zustand-helpers";
import { FuncNodesReactPlugin, upgradeFuncNodesReactPlugin } from "@/plugins";
export interface PluginManagerManagerAPI {
  plugins: UseBoundStore<
    StoreApi<{ [key: string]: FuncNodesReactPlugin | undefined }>
  >;
  add_plugin: (name: string, plugin: FuncNodesReactPlugin) => void;
  render_options: UseBoundStore<StoreApi<RenderOptions>>;
  update_render_options: (options: RenderOptions) => void;
}

export class PluginManagerHandler
  extends AbstractFuncNodesReactFlowHandleHandler
  implements PluginManagerManagerAPI
{
  plugins: UseBoundStore<
    StoreApi<{ [key: string]: FuncNodesReactPlugin | undefined }>
  >;
  render_options: UseBoundStore<StoreApi<RenderOptions>>;
  constructor(context: FuncNodesReactFlowHandlerContext) {
    super(context);
    this.plugins = create<{
      [key: string]: FuncNodesReactPlugin | undefined;
    }>((_set, _get) => ({}));
    this.render_options = create<RenderOptions>((_set, _get) => ({}));
  }

  add_plugin(name: string, plugin: FuncNodesReactPlugin) {
    if (plugin === undefined) return;
    const latestplugin = upgradeFuncNodesReactPlugin(plugin);
    this.plugins.setState((prev) => {
      return { ...prev, [name]: latestplugin };
    });
  }
  update_render_options(options: RenderOptions) {
    update_zustand_store(this.render_options, options);
  }
}
