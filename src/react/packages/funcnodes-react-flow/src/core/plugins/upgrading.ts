import { FuncNodesReactPlugin } from "./types";

const SUPPORTED_VERSION = ["1"];
const CURRENT_VERSION = "1.0.0";

export const upgradeFuncNodesReactPlugin = (
  plugin: FuncNodesReactPlugin
): FuncNodesReactPlugin<typeof CURRENT_VERSION> => {
  if (
    !plugin.v.toString().includes(".") || // old polugin version without "."
    !SUPPORTED_VERSION.includes(plugin.v.toString().split(".")[0])
  ) {
    throw new Error(`Unsupported version: ${plugin.v}`);
  }
  return { ...plugin, v: CURRENT_VERSION };
};
