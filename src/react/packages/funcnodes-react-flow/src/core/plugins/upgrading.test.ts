import { describe, expect, it } from "vitest";
import { upgradeFuncNodesReactPlugin } from "./upgrading";
import { LATEST_VERSION, type VersionedFuncNodesReactPlugin } from "./types";

describe("upgradeFuncNodesReactPlugin", () => {
  it("upgrades supported plugin versions to the latest version", () => {
    const factory = () => ({});
    const plugin: VersionedFuncNodesReactPlugin = {
      v: "1.2.3",
      renderpluginfactory: factory,
    };

    const upgraded = upgradeFuncNodesReactPlugin(plugin);

    expect(upgraded.v).toBe(LATEST_VERSION);
    expect(upgraded.renderpluginfactory).toBe(factory);
  });

  it("throws on legacy versions without a dot", () => {
    const plugin: VersionedFuncNodesReactPlugin = {
      v: "1",
    };

    expect(() => upgradeFuncNodesReactPlugin(plugin)).toThrow(
      "Unsupported version: 1"
    );
  });

  it("throws on unsupported major versions", () => {
    const plugin: VersionedFuncNodesReactPlugin = {
      v: "2.0.0",
    };

    expect(() => upgradeFuncNodesReactPlugin(plugin)).toThrow(
      "Unsupported version: 2.0.0"
    );
  });
});
