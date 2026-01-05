import { describe, it, expect } from "vitest";
import { assert_reactflow_node } from "./node";
import { selector } from "./node-types";
import { NodeStore, NodeType } from "@/nodes-core";

const makeStore = (node: NodeType) => ({
  getState: () => node,
} as NodeStore);

describe("assert_reactflow_node", () => {
  it("fills missing frontend properties with defaults", () => {
    const node = {
      id: "node-1",
      node_id: "node-1",
      node_name: "Node 1",
      name: "Node 1",
      in_trigger: false,
      inputs: [],
      outputs: [],
      io_order: [],
      progress: {},
      properties: {},
      reset_inputs_on_trigger: false,
    } as unknown as NodeType;

    const store = makeStore(node);
    const rfNode = assert_reactflow_node(store);

    expect(rfNode.position).toEqual({ x: 0, y: 0 });
    expect(rfNode.properties["frontend:size"]).toEqual([200, 100]);
    expect(rfNode.properties["frontend:collapsed"]).toBe(false);
  });

  it("calculates position from reactflow instance when available", () => {
    const node = {
      id: "node-2",
      node_id: "node-2",
      node_name: "Node 2",
      name: "Node 2",
      in_trigger: false,
      inputs: [],
      outputs: [],
      io_order: [],
      progress: {},
      properties: { "frontend:size": [200, 100] },
      reset_inputs_on_trigger: false,
    } as unknown as NodeType;

    const store = makeStore(node);
    const fnrfInstance = {
      reactflowRef: {
        getBoundingClientRect: () => ({ left: 10, top: 20, width: 200, height: 100 }),
      },
      rf_instance: {
        screenToFlowPosition: ({ x, y }: { x: number; y: number }) => ({
          x: x + 5,
          y: y + 5,
        }),
      },
    } as any;

    const rfNode = assert_reactflow_node(store, fnrfInstance);

    expect(rfNode.position.x).toBeCloseTo(10 + 200 / 2 + 5 - 100);
    expect(rfNode.position.y).toBeCloseTo(20 + 100 / 2 + 5 - 100);
  });

  it("throws when node id is missing", () => {
    const node = {
      id: undefined,
      node_id: "node-3",
      node_name: "Node 3",
      name: "Node 3",
      in_trigger: false,
      inputs: [],
      outputs: [],
      io_order: [],
      progress: {},
      properties: {},
      reset_inputs_on_trigger: false,
    } as unknown as NodeType;

    const store = makeStore(node);
    expect(() => assert_reactflow_node(store)).toThrow("Node must have an id");
  });
});

describe("selector", () => {
  it("returns react flow state pieces", () => {
    const state = {
      getNodes: () => ["node"],
      getEdges: () => ["edge"],
      onNodesChange: () => "nodes-change",
      onEdgesChange: () => "edges-change",
      onConnect: () => "connect",
    } as any;

    expect(selector(state)).toEqual({
      nodes: ["node"],
      edges: ["edge"],
      onNodesChange: state.onNodesChange,
      onEdgesChange: state.onEdgesChange,
      onConnect: state.onConnect,
    });
  });
});
