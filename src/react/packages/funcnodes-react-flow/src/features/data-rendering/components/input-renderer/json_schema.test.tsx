import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { create } from "zustand";

import { JsonSchemaInput } from "./json_schema";
import { IOContext } from "@/nodes";
import { FuncNodesContext } from "@/providers";
import { createIOStore } from "@/nodes-core/stores/iostore";
import type { FuncNodesReactFlow } from "@/funcnodes-context";

const inputconverter: [(v: unknown) => unknown, (v: unknown) => unknown] = [
  (v) => v,
  (v) => v,
];

const schema = {
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
    fullvalue: {
      data: {
        name: "Old",
      },
    },
    value: {
      data: {
        name: "Old",
      },
    },
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

    await user.click(screen.getByRole("button", { name: "Edit" }));

    const input = await screen.findByLabelText(/Name/);
    expect(input).toHaveValue("Old");
  });

  it("keeps edited values after a parent rerender", async () => {
    const fnrf = createFnrfContext();
    const iostore = createTestIOStore();
    const user = userEvent.setup();

    render(<JsonSchemaHarness fnrf={fnrf} iostore={iostore} />);

    await user.click(screen.getByRole("button", { name: "Edit" }));

    const input = await screen.findByLabelText(/Name/);
    await user.clear(input);
    await user.type(input, "New");

    expect(input).toHaveValue("New");

    await user.click(screen.getByRole("button", { name: "Force rerender" }));

    await waitFor(() => {
      expect(screen.getByLabelText(/Name/)).toHaveValue("New");
    });
  });
});
