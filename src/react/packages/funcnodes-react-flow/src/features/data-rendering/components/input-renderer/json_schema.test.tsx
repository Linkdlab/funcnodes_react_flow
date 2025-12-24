import { describe, it, expect } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { create } from "zustand";

import { JsonSchemaInput } from "./json_schema";
import { IOContext } from "@/nodes";
import { FuncNodesContext } from "@/providers";
import { createIOStore } from "@/nodes-core";
import { JSONStructure } from "@/data-structures";
import type { FuncNodesReactFlow } from "@/funcnodes-context";
import { RJSFSchema } from "@rjsf/utils";

const inputconverter: [(v: unknown) => unknown, (v: unknown) => unknown] = [
  (v) => v,
  (v) => v,
];

const schema: RJSFSchema = {
  type: "object",
  properties: {
    name: {
      type: "string",
      title: "Name",
    },
  },
  required: ["name"],
};

const createFnrfContext = (): FuncNodesReactFlow => {
  const local_state = create(() => ({
    funcnodescontainerRef: document.body,
  }));
  return {
    local_state,
    worker: undefined,
  } as unknown as FuncNodesReactFlow;
};

const createTestIOStore = () =>
  createIOStore("node-1", {
    id: "io-1",
    name: "Test IO",
    node: "node-1",
    full_id: "node-1.io-1",
    type: "json",
    is_input: true,
    render_options: {
      set_default: true,
      type: "json",
      schema,
    },
    fullvalue: JSONStructure.fromObject({
      name: "Old",
    }),
    value: JSONStructure.fromObject({
      name: "Old",
    }),
  });

const JsonSchemaHarness = ({
  fnrf,
  iostore,
}: {
  fnrf: FuncNodesReactFlow;
  iostore: ReturnType<typeof createTestIOStore>;
}) => {
  const [, setTick] = React.useState(0);
  return (
    <FuncNodesContext.Provider value={fnrf}>
      <IOContext.Provider value={iostore}>
        <button type="button" onClick={() => setTick((value) => value + 1)}>
          Force rerender
        </button>
        <JsonSchemaInput inputconverter={inputconverter} />
      </IOContext.Provider>
    </FuncNodesContext.Provider>
  );
};

describe("JsonSchemaInput", () => {
  it("renders initial form data from the full value", async () => {
    const fnrf = createFnrfContext();
    const iostore = createTestIOStore();
    const user = userEvent.setup();

    render(<JsonSchemaHarness fnrf={fnrf} iostore={iostore} />);

    // Click hidden button (hidden because of dialog overlay, sometimes) or just wait for it
    await user.click(screen.getByRole("button", { name: "Edit" }));

    // Wait for the input to appear and have the value
    // findByLabelText waits by default
    const input = await screen.findByLabelText(/Name/);

    // In MUI, the input value might be empty initially if it's controlled and waiting for state update
    await waitFor(
      () => {
        expect(input).toHaveValue("Old");
      },
      { timeout: 3000 }
    );
  });

  it("keeps edited values after a parent rerender", async () => {
    const fnrf = createFnrfContext();
    const iostore = createTestIOStore();
    // Disable pointer event check because we are clicking a button behind a modal overlay
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    render(<JsonSchemaHarness fnrf={fnrf} iostore={iostore} />);

    await user.click(screen.getByRole("button", { name: "Edit" }));

    const input = await screen.findByLabelText(/Name/);

    // Wait for the input to have the initial value before clearing it
    await waitFor(() => {
      expect(input).toHaveValue("Old");
    });

    await user.clear(input);
    await user.type(input, "New");

    expect(input).toHaveValue("New");

    // Click hidden button (hidden because of dialog overlay)
    // We use fireEvent because userEvent might still be picky about visibility even with pointerEventsCheck=0
    // But let's try user.click first since we disabled the check.
    // Actually, simply using fireEvent.click is safer for this 'hacky' harness interaction.
    fireEvent.click(
      screen.getByRole("button", { name: "Force rerender", hidden: true })
    );

    await waitFor(
      () => {
        // Re-query the input to avoid stale element issues
        const reRenderedInput = screen.getByLabelText(/Name/);
        expect(reRenderedInput).toHaveValue("New");
      },
      { timeout: 3000 }
    );
  });
});
