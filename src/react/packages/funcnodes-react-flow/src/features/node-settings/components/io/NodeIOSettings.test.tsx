import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { create } from "zustand";

import { FuncNodesContext } from "@/providers";
import { IOContext } from "@/nodes";
import { createIOStore } from "@/nodes-core";
import type { FuncNodesReactFlow } from "@/funcnodes-context";

import { NodeIOSettings } from "./NodeIOSettings";

/** Creates one input store for node IO settings component tests. */
const createTestIOStore = () =>
  createIOStore("node-1", {
    id: "input",
    name: "Input",
    node: "node-1",
    full_id: "node-1.input",
    is_input: true,
    type: "Any",
    render_options: {
      set_default: true,
      type: "Any",
    },
    connected: false,
    does_trigger: true,
    hidden: false,
    emit_value_set: true,
    required: true,
  });

/** Creates the minimal FuncNodes context used by node IO settings tests. */
const createFnrfContext = (updateIOOptions: (payload: any) => void) => {
  const render_options = create(() => ({
    typemap: {},
    inputconverter: {},
  }));
  const local_state = create(() => ({}));

  return {
    render_options,
    local_state,
    worker: {
      api: {
        node: {
          update_io_options: updateIOOptions,
        },
      },
    },
  } as unknown as FuncNodesReactFlow;
};

/** Renders node IO settings with IO and worker API providers. */
const renderNodeIOSettings = (updateIOOptions: (payload: any) => void) => {
  const iostore = createTestIOStore();
  const fnrf = createFnrfContext(updateIOOptions);

  return render(
    <FuncNodesContext.Provider value={fnrf}>
      <IOContext.Provider value={iostore}>
        <NodeIOSettings />
      </IOContext.Provider>
    </FuncNodesContext.Provider>
  );
};

describe("NodeIOSettings", () => {
  it("updates an input's does_trigger flag from the settings checkbox", async () => {
    const user = userEvent.setup();
    const updateIOOptions = vi.fn();
    renderNodeIOSettings(updateIOOptions);

    await user.click(screen.getByLabelText("Does Trigger:"));

    expect(updateIOOptions).toHaveBeenCalledWith({
      nid: "node-1",
      ioid: "input",
      options: { does_trigger: false },
    });
  });
});
