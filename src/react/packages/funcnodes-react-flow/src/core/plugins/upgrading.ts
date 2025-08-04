import {
  FuncNodesReactPlugin,
  VersionedFuncNodesReactPlugin,
  LATEST_VERSION,
} from "./types";

const SUPPORTED_VERSION = ["1"];

export const upgradeFuncNodesReactPlugin = (
  plugin: VersionedFuncNodesReactPlugin
): FuncNodesReactPlugin => {
  if (
    !plugin.v.toString().includes(".") || // old polugin version without "."
    !SUPPORTED_VERSION.includes(plugin.v.toString().split(".")[0])
  ) {
    throw new Error(`Unsupported version: ${plugin.v}`);
  }
  return { ...plugin, v: LATEST_VERSION };
};
