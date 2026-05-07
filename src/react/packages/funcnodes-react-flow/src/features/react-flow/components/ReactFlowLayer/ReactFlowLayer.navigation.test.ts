import { describe, expect, it, vi } from "vitest";
import * as React from "react";
import { render } from "@testing-library/react";

import { DEFAULT_FN_PROPS } from "@/app";
import { FuncNodesReactFlow } from "@/funcnodes-context";
import { FuncNodesContext } from "@/providers";
import { Toasts } from "@/shared-components";
import { createNodeStore } from "@/nodes-core";
import type { SerializedNodeType } from "@/nodes-core";
import type { Node as RFNode } from "@xyflow/react";
import {
  enterExecutableGroupFromNodeDoubleClick,
  ReactFlowLayer,
} from "./ReactFlowLayer";

const reactFlowMockState = vi.hoisted(() => ({
  props: undefined as any,
}));

vi.mock("@xyflow/react", async () => {
  const React = await import("react");
  return {
    ReactFlow: (props: any) => {
      reactFlowMockState.props = props;
      return React.createElement("div", { "data-testid": "mock-react-flow" });
    },
    Background: () => null,
    MiniMap: () => null,
    BackgroundVariant: {
      Cross: "cross",
      Dots: "dots",
      Lines: "lines",
    },
    useKeyPress: () => false,
    useReactFlow: () => ({
      getEdges: () => [],
    }),
  };
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
      "frontend:size": [200, 100],
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

const makeRFNode = (
  serializedNode: SerializedNodeType,
  overrides: Partial<RFNode> = {}
): RFNode =>
  ({
    id: serializedNode.id,
    type: "default",
    position: { x: 0, y: 0 },
    data: {
      nodestore: createNodeStore(serializedNode),
    },
    ...overrides,
  } as RFNode);

const makeFlow = ({
  loading = false,
  syncError,
}: {
  loading?: boolean;
  syncError?: Error;
} = {}) => {
  const toastError = vi.fn();
  return {
    flow: {
      active_nodespace: {
        getState: () => ({ loading }),
      },
      enter_group_nodespace: vi.fn(),
      sync_active_nodespace: syncError
        ? vi.fn().mockRejectedValue(syncError)
        : vi.fn().mockResolvedValue(undefined),
      getStateManager: () => ({
        toaster: {
          error: toastError,
        },
      }),
    } as unknown as FuncNodesReactFlow,
    toastError,
  };
};

describe("enterExecutableGroupFromNodeDoubleClick", () => {
  it("enters an executable group nodespace with the node display label", async () => {
    const groupNode = makeRFNode(
      makeSerializedNode("group-node", {
        node_id: "funcnodes_core.group",
        name: "Group Node",
      })
    );
    const { flow } = makeFlow();

    await enterExecutableGroupFromNodeDoubleClick(flow, groupNode);

    expect(flow.enter_group_nodespace).toHaveBeenCalledWith(
      "group-node",
      "Group Node"
    );
    expect(flow.sync_active_nodespace).toHaveBeenCalledTimes(1);
  });

  it("does not navigate when double-clicking a normal node", async () => {
    const normalNode = makeRFNode(makeSerializedNode("normal-node"));
    const { flow } = makeFlow();

    await enterExecutableGroupFromNodeDoubleClick(flow, normalNode);

    expect(flow.enter_group_nodespace).not.toHaveBeenCalled();
    expect(flow.sync_active_nodespace).not.toHaveBeenCalled();
  });

  it("does not navigate when double-clicking a legacy visual group container", async () => {
    const legacyGroupNode = {
      id: "legacy-group",
      type: "group",
      position: { x: 0, y: 0 },
      data: {},
    } as RFNode;
    const { flow } = makeFlow();

    await enterExecutableGroupFromNodeDoubleClick(flow, legacyGroupNode);

    expect(flow.enter_group_nodespace).not.toHaveBeenCalled();
    expect(flow.sync_active_nodespace).not.toHaveBeenCalled();
  });

  it("does not navigate when double-clicking an interactive node control", async () => {
    const groupNode = makeRFNode(
      makeSerializedNode("group-node", { node_id: "funcnodes_core.group" })
    );
    const button = document.createElement("button");
    const event = { target: button } as unknown as React.MouseEvent;
    const { flow } = makeFlow();

    await enterExecutableGroupFromNodeDoubleClick(flow, groupNode, event);

    expect(flow.enter_group_nodespace).not.toHaveBeenCalled();
    expect(flow.sync_active_nodespace).not.toHaveBeenCalled();
  });

  it("does not navigate when double-clicking an IO handle", async () => {
    const groupNode = makeRFNode(
      makeSerializedNode("group-node", { node_id: "funcnodes_core.group" })
    );
    const handle = document.createElement("div");
    handle.className = "react-flow__handle";
    const event = { target: handle } as unknown as React.MouseEvent;
    const { flow } = makeFlow();

    await enterExecutableGroupFromNodeDoubleClick(flow, groupNode, event);

    expect(flow.enter_group_nodespace).not.toHaveBeenCalled();
    expect(flow.sync_active_nodespace).not.toHaveBeenCalled();
  });

  it("does not push a duplicate path entry while active nodespace sync is loading", async () => {
    const groupNode = makeRFNode(
      makeSerializedNode("group-node", { node_id: "funcnodes_core.group" })
    );
    const { flow } = makeFlow({ loading: true });

    await enterExecutableGroupFromNodeDoubleClick(flow, groupNode);

    expect(flow.enter_group_nodespace).not.toHaveBeenCalled();
    expect(flow.sync_active_nodespace).not.toHaveBeenCalled();
  });

  it("shows a toast when entering a group fails during sync", async () => {
    const groupNode = makeRFNode(
      makeSerializedNode("group-node", { node_id: "funcnodes_core.group" })
    );
    const { flow, toastError } = makeFlow({
      syncError: new Error("group snapshot failed"),
    });

    await expect(
      enterExecutableGroupFromNodeDoubleClick(flow, groupNode)
    ).resolves.toBe(false);

    expect(flow.enter_group_nodespace).toHaveBeenCalledWith(
      "group-node",
      "Example"
    );
    expect(toastError).toHaveBeenCalledWith({
      title: "Could not enter group",
      description: "group snapshot failed",
    });
  });

  it("wires executable group navigation into React Flow node double-clicks", async () => {
    const flow = new FuncNodesReactFlow({
      ...DEFAULT_FN_PROPS,
      id: "react-flow-layer-navigation-test",
      useWorkerManager: false,
    });
    const enterSpy = vi.spyOn(flow, "enter_group_nodespace");
    const syncSpy = vi
      .spyOn(flow, "sync_active_nodespace")
      .mockResolvedValue(undefined);
    const groupNode = makeRFNode(
      makeSerializedNode("group-node", {
        node_id: "funcnodes_core.group",
        name: "Group Node",
      })
    );

    render(
      React.createElement(
        Toasts,
        null,
        React.createElement(
          FuncNodesContext.Provider,
          { value: flow },
          React.createElement(ReactFlowLayer, DEFAULT_FN_PROPS.flow)
        )
      )
    );

    await reactFlowMockState.props.onNodeDoubleClick(
      { target: document.createElement("div") },
      groupNode
    );

    expect(enterSpy).toHaveBeenCalledWith("group-node", "Group Node");
    expect(syncSpy).toHaveBeenCalledTimes(1);
  });
});
