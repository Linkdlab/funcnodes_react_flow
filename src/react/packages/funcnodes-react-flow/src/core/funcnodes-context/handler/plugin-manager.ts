import {
  AbstractFuncNodesReactFlowHandleHandler,
  FuncNodesReactFlowHandlerContext,
} from "./rf-handlers.types";
import { UseBoundStore, StoreApi, create } from "zustand";
import { RenderOptions } from "@/data-rendering-types";
import { update_zustand_store } from "@/zustand-helpers";
import {
  FuncNodesReactPlugin,
  PackedPlugin,
  VersionedFuncNodesReactPlugin,
  upgradeFuncNodesReactPlugin,
} from "@/plugins";
import * as React from "react";
import * as FuncNodesReactFlow from "../../../";
export interface PluginManagerManagerAPI {
  plugins: UseBoundStore<
    StoreApi<{ [key: string]: FuncNodesReactPlugin | undefined }>
  >;
  add_plugin: (name: string, plugin: FuncNodesReactPlugin) => void;
  add_packed_plugin: (name: string, plugin: PackedPlugin) => void;
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

  add_plugin(name: string, plugin: VersionedFuncNodesReactPlugin) {
    if (plugin === undefined) return;
    try {
      const latestplugin = upgradeFuncNodesReactPlugin(plugin);
      this.plugins.setState((prev) => {
        return { ...prev, [name]: latestplugin };
      });
    } catch (e) {
      if (e instanceof Error) {
        this.context.rf.logger.error(`Error loading plugin ${name}`, e);
      } else {
        this.context.rf.logger.error(
          `Error loading plugin ${name}`,
          new Error(String(e))
        );
      }
      this.stateManager.toaster?.error({
        title: "Error",
        description: `Error loading plugin ${name}: ${
          e instanceof Error ? e.message : String(e)
        }`,
        duration: 5000,
      });
    }
  }
  update_render_options(options: RenderOptions) {
    update_zustand_store(this.render_options, options);
  }

  async add_packed_plugin(name: string, plugin: PackedPlugin) {
    if (plugin.js) {
      for (const js of plugin.js) {
        const scripttag = document.createElement("script");

        scripttag.text = atob(js);

        document.body.appendChild(scripttag);
      }
    }
    if (plugin.css) {
      for (const css of plugin.css) {
        const styletag = document.createElement("style");
        styletag.innerHTML = atob(css);
        document.head.appendChild(styletag);
      }
    }

    if (plugin.module !== undefined) {
      /// import the plugin
      const binaryString = atob(plugin.module);

      try {
        const factory = new Function(
          "React",
          "FuncNodesReactFlow",
          `
          return (async () => {
            ${binaryString}
            return FuncNodesPlugin;
          })();
        `
        );
        const module = await factory(React, FuncNodesReactFlow);
        this.add_plugin(name, module);
      } catch (e) {
        if (e instanceof Error) {
          this.context.rf.logger.error(`Error building plugin ${name}`, e);
        } else {
          this.context.rf.logger.error(
            `Error building plugin ${name}`,
            new Error(String(e))
          );
        }
        this.stateManager.toaster?.error({
          title: "Error",
          description: `Error building plugin ${name}: ${e}`,
          duration: 5000,
        });
      }
    }
  }
}
