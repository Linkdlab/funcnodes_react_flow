import { describe, expect, it, vi } from "vitest";
import type { Node } from "@xyflow/react";
import { split_rf_nodes, sortByParent } from "./node-utils";

const makeNode = (
  id: string,
  overrides: Partial<Node> = {}
): Node => ({
  id,
  position: { x: 0, y: 0 },
  data: {},
  ...overrides,
});

describe("split_rf_nodes", () => {
  it("separates group nodes from default nodes", () => {
    const nodes: Node[] = [
      makeNode("group-1", { type: "group" }),
      makeNode("node-1", { type: "default" }),
    ];

    const { group_nodes, default_nodes } = split_rf_nodes(nodes);

    expect(group_nodes.map((node) => node.id)).toEqual(["group-1"]);
    expect(default_nodes.map((node) => node.id)).toEqual(["node-1"]);
  });

  it("returns empty group list when no groups exist", () => {
    const nodes: Node[] = [makeNode("node-1"), makeNode("node-2")];

    const { group_nodes, default_nodes } = split_rf_nodes(nodes);

    expect(group_nodes).toEqual([]);
    expect(default_nodes.map((node) => node.id)).toEqual(["node-1", "node-2"]);
  });
});

describe("sortByParent", () => {
  it("ensures parents are listed before their children", () => {
    const nodes: Node[] = [
      makeNode("child", { parentId: "parent" }),
      makeNode("parent"),
    ];

    const sorted = sortByParent(nodes);

    expect(sorted.map((node) => node.id)).toEqual(["parent", "child"]);
  });

  it("treats nodes with missing parents as roots", () => {
    const nodes: Node[] = [
      makeNode("orphan", { parentId: "missing" }),
      makeNode("root"),
    ];

    const sorted = sortByParent(nodes);

    expect(sorted.map((node) => node.id)).toEqual(["orphan", "root"]);
  });

  it("warns and preserves nodes when a cycle is detected", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const nodes: Node[] = [
      makeNode("a", { parentId: "b" }),
      makeNode("b", { parentId: "a" }),
    ];

    const sorted = sortByParent(nodes);

    expect(warnSpy).toHaveBeenCalled();
    expect(sorted.map((node) => node.id)).toEqual(["a", "b"]);
  });
});
