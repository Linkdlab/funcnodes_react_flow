import { describe, expect, it, vi } from "vitest";
import type { Node } from "@xyflow/react";
import {
  getGroupPayload,
  isExecutableGroupNode,
  isGroupInputGateway,
  isGroupOutputGateway,
  split_rf_nodes,
  sortByParent,
} from "./node-utils";
import type { SerializedNodeType } from "../serializations";

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

const makeSerializedNode = (
  id: string,
  overrides: Partial<SerializedNodeType> = {}
): SerializedNodeType =>
  ({
    id,
    node_id: "example.node",
    node_name: "Example",
    name: "Example",
    properties: {
      "frontend:collapsed": false,
      "frontend:pos": [0, 0],
      "frontend:size": [200, 250],
    },
    reset_inputs_on_trigger: false,
    in_trigger: false,
    inputs: [],
    outputs: [],
    io_order: [],
    io: {},
    progress: {},
    ...overrides,
  } as SerializedNodeType);

const validGroupPayload = {
  version: 1,
  inner_nodespace: {
    nodes: [],
    edges: [],
    prop: {},
    groups: {},
  },
  input_gateway_node: "group-input-node",
  output_gateway_node: "group-output-node",
  input_bindings: {},
  output_bindings: {},
};

describe("executable group node helpers", () => {
  it("identifies executable group nodes by node_id", () => {
    const groupNode = makeSerializedNode("group-node", {
      node_id: "funcnodes_core.group",
    });

    expect(isExecutableGroupNode(groupNode)).toBe(true);
  });

  it("does not treat legacy React Flow group nodes as executable groups", () => {
    const legacyGroupNode = makeNode("legacy-group", { type: "group" });

    expect(isExecutableGroupNode(legacyGroupNode)).toBe(false);
  });

  it("does not treat normal nodes as executable groups", () => {
    const normalNode = makeSerializedNode("normal-node");

    expect(isExecutableGroupNode(normalNode)).toBe(false);
  });

  it("reads a supported group payload from executable group properties", () => {
    const groupNode = makeSerializedNode("group-node", {
      node_id: "funcnodes_core.group",
      properties: {
        "frontend:collapsed": false,
        "frontend:pos": [0, 0],
        "frontend:size": [200, 250],
        group: validGroupPayload,
      },
    });

    expect(getGroupPayload(groupNode)).toEqual(validGroupPayload);
  });

  it("returns undefined when an executable group has no payload", () => {
    const groupNode = makeSerializedNode("group-node", {
      node_id: "funcnodes_core.group",
    });

    expect(getGroupPayload(groupNode)).toBeUndefined();
  });

  it("rejects unsupported group payload versions with a clear error", () => {
    const groupNode = makeSerializedNode("group-node", {
      node_id: "funcnodes_core.group",
      properties: {
        "frontend:collapsed": false,
        "frontend:pos": [0, 0],
        "frontend:size": [200, 250],
        group: {
          ...validGroupPayload,
          version: 2,
        },
      },
    });

    expect(() => getGroupPayload(groupNode)).toThrow(
      "Unsupported executable group payload version: 2"
    );
  });

  it("identifies group gateway node classes", () => {
    expect(
      isGroupInputGateway(
        makeSerializedNode("input-gateway", {
          node_id: "funcnodes_core.group.input",
        })
      )
    ).toBe(true);
    expect(
      isGroupOutputGateway(
        makeSerializedNode("output-gateway", {
          node_id: "funcnodes_core.group.output",
        })
      )
    ).toBe(true);
    expect(isGroupInputGateway(makeSerializedNode("normal-node"))).toBe(false);
    expect(isGroupOutputGateway(makeSerializedNode("normal-node"))).toBe(false);
  });
});
