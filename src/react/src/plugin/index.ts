import { latest as latest_types } from "../types/versioned/versions.t";
import { upgradePlugin } from "./v1";

export interface PackedPlugin {
  module: string;
  js?: string[];
  css?: string[];
}

export const upgradeFuncNodesReactPlugin = (
  plugin: latest_types.AnyFuncNodesReactPlugin
): latest_types.FuncNodesReactPlugin => {
  return upgradePlugin(plugin);
};
