import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FuncNodesContext } from "@/providers";
import { createNodeStore } from "@/nodes-core";
import type { SerializedIOType, SerializedNodeType } from "@/nodes-core";
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

/** Renders boundary settings with a mocked FuncNodes worker group API. */
const renderBoundarySettings = (groupApi: Record<string, any>) => {
  const toastError = vi.fn();
  const flow = {
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
  const nodestore = createNodeStore(makeGroupNode());
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

    await user.type(screen.getByLabelText("Input ID"), "extra");
    await user.type(screen.getByLabelText("Input name"), "Extra Input");
    await user.clear(screen.getByLabelText("Input type"));
    await user.type(screen.getByLabelText("Input type"), "float");
    await user.click(screen.getByRole("button", { name: "Add public input" }));

    expect(addGroupInput).toHaveBeenCalledWith("group-node", {
      id: "extra",
      name: "Extra Input",
      type: "float",
    });
  });

  it("adds a public output through the path-aware worker group API", async () => {
    const user = userEvent.setup();
    const addGroupOutput = vi.fn().mockResolvedValue(undefined);
    renderBoundarySettings({ add_group_output: addGroupOutput });

    await user.type(screen.getByLabelText("Output ID"), "total");
    await user.type(screen.getByLabelText("Output name"), "Total");
    await user.clear(screen.getByLabelText("Output type"));
    await user.type(screen.getByLabelText("Output type"), "float");
    await user.click(screen.getByRole("button", { name: "Add public output" }));

    expect(addGroupOutput).toHaveBeenCalledWith("group-node", {
      id: "total",
      name: "Total",
      type: "float",
    });
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

  it("shows duplicate boundary errors without issuing follow-up edits", async () => {
    const user = userEvent.setup();
    const addGroupInput = vi
      .fn()
      .mockRejectedValue(new Error("Group input 'value' already exists"));
    const updateGroupIO = vi.fn();
    const { toastError } = renderBoundarySettings({
      add_group_input: addGroupInput,
      update_group_io: updateGroupIO,
    });

    await user.type(screen.getByLabelText("Input ID"), "value");
    await user.click(screen.getByRole("button", { name: "Add public input" }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith({
        title: "Could not add public input",
        description: "Group input 'value' already exists",
      });
    });
    expect(updateGroupIO).not.toHaveBeenCalled();
  });
});
