import { v0 as v0_types } from "../../types/versioned/versions.t";
export const upgradePlugin_v0 = (
  plugin: v0_types.FuncNodesReactPlugin
): v0_types.FuncNodesReactPlugin => {
  const v = plugin.v ? Number(plugin.v) : 0;
  if (v > 0) throw new Error("Plugin version is too new");
  if (v === 0) return plugin as v0_types.FuncNodesReactPlugin;
  return plugin;
};
