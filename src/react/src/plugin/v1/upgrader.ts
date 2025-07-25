import { JSX } from "react";

import { assertNever } from "../helper";
import { v1_types } from "@/barrel_imports";
import { v0_types } from "@/barrel_imports";
import { upgradePlugin_v0 } from "../v0";

type olderPlugins_v1 = v0_types.FuncNodesReactPlugin;

export class IOHelperClass implements v0_types.IOType {
  constructor(iostore: v1_types.IOStore) {
    this.iostore = iostore;
  }
  iostore: v1_types.IOStore;

  get connected(): boolean {
    return this.iostore.getState().connected;
  }
  set connected(v: boolean) {
    this.iostore.setState({ connected: v });
  }
  get does_trigger(): boolean {
    return this.iostore.getState().does_trigger;
  }
  set does_trigger(v: boolean) {
    this.iostore.setState({ does_trigger: v });
  }
  get full_id(): string {
    return this.iostore.getState().full_id;
  }
  set full_id(v: string) {
    this.iostore.setState({ full_id: v });
  }
  get id(): string {
    return this.iostore.getState().id;
  }
  set id(v: string) {
    this.iostore.setState({ id: v });
  }
  get is_input(): boolean {
    return this.iostore.getState().is_input;
  }
  set is_input(v: boolean) {
    this.iostore.setState({ is_input: v });
  }
  get name(): string {
    return this.iostore.getState().name;
  }
  set name(v: string) {
    this.iostore.setState({ name: v });
  }
  get node(): string {
    return this.iostore.getState().node;
  }
  set node(v: string) {
    this.iostore.setState({ node: v });
  }
  get type(): v0_types.SerializedType {
    return this.iostore.getState().type;
  }
  set type(v: v0_types.SerializedType) {
    this.iostore.setState({ type: v });
  }
  get value(): any {
    return this.iostore.valuestore.getState().preview;
  }
  set value(v: any) {
    this.iostore.updateValueStore({ preview: v });
  }
  get fullvalue(): any {
    return this.iostore.valuestore.getState().full;
  }
  set fullvalue(v: any) {
    this.iostore.updateValueStore({ full: v });
  }
  get render_options(): v0_types.IORenderOptions {
    return this.iostore.getState().render_options;
  }
  set render_options(v: v0_types.IORenderOptions) {
    this.iostore.setState({ render_options: v });
  }

  get hidden(): boolean {
    return this.iostore.getState().hidden;
  }
  set hidden(v: boolean) {
    this.iostore.setState({ hidden: v });
  }

  get try_get_full_value(): undefined | (() => void) {
    return this.iostore.getState().try_get_full_value;
  }

  get set_hidden(): undefined | ((v: boolean) => void) {
    return this.iostore.getState().set_hidden;
  }
}

const wrap_io_ele_gen = <
  K extends { io: v0_types.IOType },
  L extends Omit<K, "io">
>(
  gen: (props: K) => JSX.Element
): ((p: { iostore: v1_types.IOStore } & L) => JSX.Element) => {
  return (p: { iostore: v1_types.IOStore } & L) => {
    const { iostore, ...rest } = p; // remove iostore from the properties
    const io: v0_types.IOType = new IOHelperClass(iostore);
    // Now rest only contains properties of L, so we can add io and assert it matches K
    return gen({ ...rest, io } as unknown as K);
  };
};

const upgradePlugin_v1 = (
  plugin: olderPlugins_v1 | v1_types.FuncNodesReactPlugin
): v1_types.FuncNodesReactPlugin => {
  const v = plugin.v ? Number(plugin.v) : 0;
  if (v > 1) throw new Error("Plugin version is too new");
  if (v === 1) return plugin as v1_types.FuncNodesReactPlugin;

  const ug = upgradePlugin_v0(plugin as olderPlugins_v1);
  const new_renderpluginfactory = (
    _props: v1_types.RenderPluginFactoryProps
  ): v1_types.RendererPlugin => {
    const plugins = ug.renderpluginfactory?.(_props) || {};
    const renderer = ug.RendererPlugin || {};

    //combine keys of renderer to a array  with unique values
    const keys = Object.keys({ ...renderer, ...plugins }) as Array<
      keyof v0_types.RendererPlugin
    >;
    const _new_renderplugin: v1_types.RendererPlugin = {};
    for (const key of keys) {
      switch (key) {
        case "input_renderers":
          const new_input_renderers: {
            [key: string]: v1_types.InputRendererType | undefined;
          } = {};
          for (const [k, v] of Object.entries(renderer.input_renderers || {})) {
            if (v === undefined) continue;
            new_input_renderers[k] = wrap_io_ele_gen(v);
          }
          _new_renderplugin.input_renderers = new_input_renderers;
          break;
        case "output_renderers":
          const new_output_renderers: {
            [key: string]: v1_types.OutputRendererType | undefined;
          } = {};
          for (const [k, v] of Object.entries(
            renderer.output_renderers || {}
          )) {
            if (v === undefined) continue;
            new_output_renderers[k] = wrap_io_ele_gen(v);
          }
          _new_renderplugin.output_renderers = new_output_renderers;
          break;
        case "handle_preview_renderers":
          const new_handle_preview_renderers: {
            [key: string]: v1_types.HandlePreviewRendererType | undefined;
          } = {};
          for (const [k, v] of Object.entries(
            renderer.handle_preview_renderers || {}
          )) {
            if (v === undefined) continue;
            new_handle_preview_renderers[k] = wrap_io_ele_gen(v);
          }
          _new_renderplugin.handle_preview_renderers =
            new_handle_preview_renderers;
          break;
        case "data_overlay_renderers":
          const new_data_overlay_renderers: {
            [key: string]: v1_types.DataOverlayRendererType | undefined;
          } = {};
          for (const [k, v] of Object.entries(
            renderer.data_overlay_renderers || {}
          )) {
            if (v === undefined) continue;
            new_data_overlay_renderers[k] = wrap_io_ele_gen(v);
          }
          _new_renderplugin.data_overlay_renderers = new_data_overlay_renderers;
          break;
        case "data_preview_renderers":
          const new_data_preview_renderers: {
            [key: string]: v1_types.DataPreviewViewRendererType | undefined;
          } = {};
          for (const [k, v] of Object.entries(
            renderer.data_preview_renderers || {}
          )) {
            if (v === undefined) continue;
            new_data_preview_renderers[k] = wrap_io_ele_gen(v);
          }
          _new_renderplugin.data_preview_renderers = new_data_preview_renderers;
          break;
        case "data_view_renderers":
          const new_data_view_renderers: {
            [key: string]: v1_types.DataViewRendererType | undefined;
          } = {};
          for (const [k, v] of Object.entries(
            renderer.data_view_renderers || {}
          )) {
            if (v === undefined) continue;
            new_data_view_renderers[k] = wrap_io_ele_gen(v);
          }
          _new_renderplugin.data_view_renderers = new_data_view_renderers;
          break;

        default:
          assertNever(key);
      }
    }
    return _new_renderplugin;
  };
  return { ...ug, renderpluginfactory: new_renderpluginfactory, v: 1 };
};

export { upgradePlugin_v1 };
