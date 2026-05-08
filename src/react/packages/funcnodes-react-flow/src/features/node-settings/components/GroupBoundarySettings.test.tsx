import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FuncNodesContext } from "@/providers";
import { createNodeStore } from "@/nodes-core";
import type { SerializedIOType, SerializedNodeType } from "@/nodes-core";
import type { NodeSpacePath } from "@/funcnodes-context";
import { GroupBoundarySettings } from "./GroupBoundarySettings";

/** Creates one serialized IO entry for group boundary settings tests. */
const makeIO = (
  id: string,
  name: string,
  isInput: boolean
): SerializedIOType => ({
  id,
  name,
  node: "group-node",
  full_id: `group-node.${id}`,
  type: "int",
  value: undefined,
  fullvalue: undefined,
  is_input: isInput,
  connected: false,
  does_trigger: false,
  render_options: {
    set_default: true,
    type: "int",
  },
  hidden: false,
  emit_value_set: true,
  required: false,
});

/** Builds a serialized executable GroupNode with one public input and output. */
const makeGroupNode = (): SerializedNodeType =>
  ({
    id: "group-node",
    node_id: "funcnodes_core.group",
    node_name: "GroupNode",
    name: "Group Node",
    description: "Executable group",
    properties: {
      "frontend:size": [200, 100],
      "frontend:pos": [0, 0],
      "frontend:collapsed": false,
    },
    reset_inputs_on_trigger: false,
    in_trigger: false,
    inputs: ["value"],
    outputs: ["result"],
    io_order: ["value", "result"],
    io: {
      value: makeIO("value", "Value", true),
      result: makeIO("result", "Result", false),
    },
    progress: {},
  }) as SerializedNodeType;

/** Builds a serialized internal group gateway node for boundary UI tests. */
const makeGatewayNode = (
  nodeId: "funcnodes_core.group.input" | "funcnodes_core.group.output"
): SerializedNodeType =>
  ({
    id: nodeId === "funcnodes_core.group.input" ? "input-gateway" : "output-gateway",
    node_id: nodeId,
    node_name:
      nodeId === "funcnodes_core.group.input"
        ? "Group Input"
        : "Group Output",
    name:
      nodeId === "funcnodes_core.group.input"
        ? "Group Input"
        : "Group Output",
    description: "Executable group gateway",
    properties: {
      "frontend:size": [180, 80],
      "frontend:pos": [0, 0],
      "frontend:collapsed": false,
    },
    reset_inputs_on_trigger: false,
    in_trigger: false,
    inputs: nodeId === "funcnodes_core.group.output" ? ["result"] : [],
    outputs: nodeId === "funcnodes_core.group.input" ? ["value"] : [],
    io_order:
      nodeId === "funcnodes_core.group.input" ? ["value"] : ["result"],
    io: {
      ...(nodeId === "funcnodes_core.group.input"
        ? { value: makeIO("value", "Value", false) }
        : { result: makeIO("result", "Result", true) }),
    },
    progress: {},
  }) as SerializedNodeType;

/** Creates a minimal active nodespace store mock for boundary settings tests. */
const makeActiveNodeSpace = (path: NodeSpacePath) => {
  const state = {
    path,
    viewportByPath: {},
    stalePathKeys: {},
    loading: false,
    error: undefined,
  };
  const activeNodeSpace = (selector?: (value: typeof state) => unknown) =>
    selector ? selector(state) : state;
  activeNodeSpace.getState = () => state;
  return activeNodeSpace;
};

/** Renders boundary settings with a mocked FuncNodes worker group API. */
const renderBoundarySettings = (
  groupApi: Record<string, any>,
  options: {
    node?: SerializedNodeType;
    activePath?: NodeSpacePath;
  } = {}
) => {
  const toastError = vi.fn();
  const flow = {
    active_nodespace: makeActiveNodeSpace(options.activePath ?? []),
    worker: {
      api: {
        group: groupApi,
      },
    },
    getStateManager: () => ({
      toaster: {
        error: toastError,
      },
    }),
  } as any;
  const nodestore = createNodeStore(options.node ?? makeGroupNode());
  return {
    toastError,
    ...render(
      <FuncNodesContext.Provider value={flow}>
        <GroupBoundarySettings nodestore={nodestore} />
      </FuncNodesContext.Provider>
    ),
  };
};

describe("GroupBoundarySettings", () => {
  it("adds a public input through the path-aware worker group API", async () => {
    const user = userEvent.setup();
    const addGroupInput = vi.fn().mockResolvedValue(undefined);
    renderBoundarySettings({ add_group_input: addGroupInput });

    await user.type(screen.getByLabelText("Input name"), "Extra Input");
    await user.click(screen.getByRole("button", { name: "Add public input" }));

    expect(addGroupInput).toHaveBeenCalledWith("group-node", {
      name: "Extra Input",
    });
    expect(screen.queryByLabelText("Input ID")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Input type")).not.toBeInTheDocument();
  });

  it("adds a public output through the path-aware worker group API", async () => {
    const user = userEvent.setup();
    const addGroupOutput = vi.fn().mockResolvedValue(undefined);
    renderBoundarySettings({ add_group_output: addGroupOutput });

    await user.type(screen.getByLabelText("Output name"), "Total");
    await user.click(screen.getByRole("button", { name: "Add public output" }));

    expect(addGroupOutput).toHaveBeenCalledWith("group-node", {
      name: "Total",
    });
    expect(screen.queryByLabelText("Output ID")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Output type")).not.toBeInTheDocument();
  });

  it("renames an existing public boundary IO through the worker API", async () => {
    const user = userEvent.setup();
    const updateGroupIO = vi.fn().mockResolvedValue(undefined);
    renderBoundarySettings({ update_group_io: updateGroupIO });

    const nameInput = screen.getByLabelText("Boundary name value");
    await user.clear(nameInput);
    await user.type(nameInput, "Renamed Value");
    nameInput.blur();

    await waitFor(() => {
      expect(updateGroupIO).toHaveBeenCalledWith("group-node", "value", {
        name: "Renamed Value",
      });
    });
  });

  it("removes an existing public boundary IO through the worker API", async () => {
    const user = userEvent.setup();
    const removeGroupIO = vi.fn().mockResolvedValue(undefined);
    renderBoundarySettings({ remove_group_io: removeGroupIO });

    await user.click(
      screen.getByRole("button", { name: "Remove boundary value" })
    );

    expect(removeGroupIO).toHaveBeenCalledWith("group-node", "value");
  });

  it("shows boundary creation errors without issuing follow-up edits", async () => {
    const user = userEvent.setup();
    const addGroupInput = vi
      .fn()
      .mockRejectedValue(new Error("Could not create group input"));
    const updateGroupIO = vi.fn();
    const { toastError } = renderBoundarySettings({
      add_group_input: addGroupInput,
      update_group_io: updateGroupIO,
    });

    await user.type(screen.getByLabelText("Input name"), "Value");
    await user.click(screen.getByRole("button", { name: "Add public input" }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith({
        title: "Could not add public input",
        description: "Could not create group input",
      });
    });
    expect(updateGroupIO).not.toHaveBeenCalled();
  });

  it("adds the current group input from the internal input gateway", async () => {
    const user = userEvent.setup();
    const addGroupInputAtPath = vi.fn().mockResolvedValue(undefined);
    renderBoundarySettings(
      { add_group_input_at_path: addGroupInputAtPath },
      {
        node: makeGatewayNode("funcnodes_core.group.input"),
        activePath: [{ groupNodeId: "group-node", label: "Group Node" }],
      }
    );

    await user.type(screen.getByLabelText("Input name"), "Extra Input");
    await user.click(screen.getByRole("button", { name: "Add public input" }));

    expect(addGroupInputAtPath).toHaveBeenCalledWith([], "group-node", {
      name: "Extra Input",
    });
    expect(
      screen.queryByRole("button", { name: "Add public output" })
    ).not.toBeInTheDocument();
  });

  it("adds the current group output from the internal output gateway", async () => {
    const user = userEvent.setup();
    const addGroupOutputAtPath = vi.fn().mockResolvedValue(undefined);
    renderBoundarySettings(
      { add_group_output_at_path: addGroupOutputAtPath },
      {
        node: makeGatewayNode("funcnodes_core.group.output"),
        activePath: [{ groupNodeId: "group-node", label: "Group Node" }],
      }
    );

    await user.type(screen.getByLabelText("Output name"), "Total");
    await user.click(screen.getByRole("button", { name: "Add public output" }));

    expect(addGroupOutputAtPath).toHaveBeenCalledWith([], "group-node", {
      name: "Total",
    });
    expect(
      screen.queryByRole("button", { name: "Add public input" })
    ).not.toBeInTheDocument();
  });

  it("targets the parent path when editing a nested current group gateway", async () => {
    const user = userEvent.setup();
    const addGroupInputAtPath = vi.fn().mockResolvedValue(undefined);
    renderBoundarySettings(
      { add_group_input_at_path: addGroupInputAtPath },
      {
        node: makeGatewayNode("funcnodes_core.group.input"),
        activePath: [
          { groupNodeId: "outer-group", label: "Outer Group" },
          { groupNodeId: "inner-group", label: "Inner Group" },
        ],
      }
    );

    await user.type(screen.getByLabelText("Input name"), "Value");
    await user.click(screen.getByRole("button", { name: "Add public input" }));

    expect(addGroupInputAtPath).toHaveBeenCalledWith(
      [{ groupNodeId: "outer-group", label: "Outer Group" }],
      "inner-group",
      { name: "Value" }
    );
  });

  it("does not render current group controls for gateway nodes at the root path", () => {
    renderBoundarySettings(
      { add_group_input_at_path: vi.fn() },
      {
        node: makeGatewayNode("funcnodes_core.group.input"),
        activePath: [],
      }
    );

    expect(screen.queryByText("Public interface")).not.toBeInTheDocument();
  });
});
