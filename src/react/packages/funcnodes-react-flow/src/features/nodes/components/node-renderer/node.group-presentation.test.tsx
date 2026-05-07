import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DEFAULT_FN_PROPS } from "@/app";
import { FuncNodesReactFlow } from "@/funcnodes-context";
import { createNodeStore } from "@/nodes-core";
import type { SerializedIOType, SerializedNodeType } from "@/nodes-core";
import { FuncNodesContext, KeyPressProvider } from "@/providers";
import { DefaultGroup } from "@/groups";
import { DefaultNode } from "./node";

vi.mock("@xyflow/react", async () => {
  const React = await import("react");
  return {
    Handle: (props: any) =>
      React.createElement("div", {
        "data-testid": "rf-handle",
        "data-handle-id": props.id,
        "data-handle-type": props.type,
        className: `react-flow__handle ${props.type ?? ""}`,
      }),
    Position: {
      Left: "left",
      Right: "right",
      Top: "top",
      Bottom: "bottom",
    },
    BackgroundVariant: {
      Cross: "cross",
      Dots: "dots",
      Lines: "lines",
    },
    useReactFlow: () => ({
      getEdges: () => [],
    }),
  };
});

/** Creates an isolated flow instance for node renderer presentation tests. */
const makeFlow = () => {
  const flow = new FuncNodesReactFlow({
    ...DEFAULT_FN_PROPS,
    id: "node-group-presentation-test",
    useWorkerManager: false,
  });
  vi.spyOn(flow, "enter_group_nodespace");
  vi.spyOn(flow, "sync_active_nodespace").mockResolvedValue(undefined);
  return flow;
};

/** Builds one fully populated serialized IO entry for renderer tests. */
const makeIO = (
  id: string,
  nodeId: string,
  name: string,
  isInput: boolean
): SerializedIOType => ({
  id,
  name,
  node: nodeId,
  full_id: `${nodeId}.${id}`,
  type: "any",
  value: undefined,
  fullvalue: undefined,
  is_input: isInput,
  connected: false,
  does_trigger: false,
  render_options: {
    set_default: true,
    type: "any",
  },
  hidden: false,
  emit_value_set: true,
  required: false,
});

/** Builds a serialized node with deterministic public input and output IO. */
const makeNode = (
  node_id: string,
  overrides: Partial<SerializedNodeType> = {}
): SerializedNodeType => {
  const nodeId = overrides.id ?? "node-1";
  return {
    id: nodeId,
    node_id,
    node_name: "Test Node",
    name: "Test Node",
    description: "Test node description",
    properties: {
      "frontend:size": [200, 100],
      "frontend:pos": [0, 0],
      "frontend:collapsed": false,
    },
    reset_inputs_on_trigger: false,
    in_trigger: false,
    inputs: ["public-input"],
    outputs: ["public-output"],
    io_order: ["public-output", "public-input"],
    io: {
      "public-input": makeIO("public-input", nodeId, "Public Input", true),
      "public-output": makeIO("public-output", nodeId, "Public Output", false),
    },
    progress: {},
    ...overrides,
  } as SerializedNodeType;
};

/** Renders a backend node with the providers used by the normal workspace. */
const renderNode = (node: SerializedNodeType, flow = makeFlow()) => {
  return {
    flow,
    ...render(
      <FuncNodesContext.Provider value={flow}>
        <KeyPressProvider>
          <DefaultNode data={{ nodestore: createNodeStore(node) }} />
        </KeyPressProvider>
      </FuncNodesContext.Provider>
    ),
  };
};

describe("DefaultNode executable group presentation", () => {
  it("renders an executable group node with normal public IO handles", () => {
    renderNode(
      makeNode("funcnodes_core.group", {
        id: "group-node",
        name: "Group Node",
        node_name: "GroupNode",
      })
    );

    const groupNode = screen.getByTestId("fn-node-group-node");
    expect(groupNode).toHaveClass("executable-group-node");
    expect(within(groupNode).getByText("Public Input")).toBeInTheDocument();
    expect(within(groupNode).getByText("Public Output")).toBeInTheDocument();
    expect(within(groupNode).getAllByTestId("rf-handle")).toHaveLength(3);
  });

  it("shows a compact enter affordance that enters the group nodespace", async () => {
    const user = userEvent.setup();
    const { flow } = renderNode(
      makeNode("funcnodes_core.group", {
        id: "group-node",
        name: "Group Node",
        node_name: "GroupNode",
      })
    );

    const enterButton = screen.getByRole("button", {
      name: "Enter group Group Node",
    });
    expect(enterButton).toHaveAttribute("data-no-group-enter", "true");

    await user.click(enterButton);

    expect(flow.enter_group_nodespace).toHaveBeenCalledWith(
      "group-node",
      "Group Node"
    );
    expect(flow.sync_active_nodespace).toHaveBeenCalledTimes(1);
  });

  it("renders group input gateways with gateway-specific class names and labels", () => {
    renderNode(makeNode("funcnodes_core.group.input"));

    const gateway = screen.getByTestId("fn-node-node-1");
    expect(gateway).toHaveClass("group-gateway-node");
    expect(gateway).toHaveClass("group-input-gateway-node");
    expect(screen.getByText("Group Input Gateway")).toBeInTheDocument();
  });

  it("renders group output gateways with gateway-specific class names and labels", () => {
    renderNode(makeNode("funcnodes_core.group.output"));

    const gateway = screen.getByTestId("fn-node-node-1");
    expect(gateway).toHaveClass("group-gateway-node");
    expect(gateway).toHaveClass("group-output-gateway-node");
    expect(screen.getByText("Group Output Gateway")).toBeInTheDocument();
  });

  it("keeps legacy UI group containers on the existing renderer path", () => {
    const flow = makeFlow();

    render(
      <FuncNodesContext.Provider value={flow}>
        <DefaultGroup data={{ group: { id: "legacy-group" } }} />
      </FuncNodesContext.Provider>
    );

    expect(screen.getByText("Group")).toHaveClass("fn-group");
    expect(screen.getByTitle("Remove group")).toHaveClass("fn-group-remove");
  });
});
