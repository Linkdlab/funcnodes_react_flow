import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { create } from "zustand";

import { FuncNodesContext } from "@/providers";
import { IOContext } from "@/nodes";
import { createIOStore } from "@/nodes-core";
import type { FuncNodesReactFlow } from "@/funcnodes-context";

import {
  BooleanInput,
  StringInput,
  NumberInput,
  FloatInput,
  IntegerInput,
  SelectionInput,
} from "./index";

const identityConverter: [(v: any) => any, (v: any) => any] = [
  (v) => v,
  (v) => v,
];

const createTestIOStore = (overrides?: {
  value?: string | number | boolean;
  fullvalue?: string | number | boolean;
  connected?: boolean;
  value_options?: {
    min?: number;
    max?: number;
    step?: number;
    options?: any;
  };
  type?: string;
}) =>
  createIOStore("node-1", {
    id: "io-1",
    name: "IO",
    node: "node-1",
    full_id: "node-1.io-1",
    is_input: true,
    type: overrides?.type ?? "string",
    render_options: {
      set_default: true,
      type: overrides?.type ?? "string",
    },
    value: overrides?.value,
    fullvalue: overrides?.fullvalue,
    connected: overrides?.connected ?? false,
    value_options: overrides?.value_options,
  });

const createFnrfContext = (setCalls: any[]): FuncNodesReactFlow => {
  const local_state = create(() => ({ reactflowRef: null }));
  const render_options = create(() => ({}));
  const worker = {
    api: {
      node: {
        set_io_value: (payload: any) => {
          setCalls.push(payload);
        },
      },
    },
  };

  return {
    local_state,
    render_options,
    worker,
  } as unknown as FuncNodesReactFlow;
};

const Providers = ({
  children,
  iostore,
  fnrf,
}: {
  children: React.ReactNode;
  iostore: ReturnType<typeof createTestIOStore>;
  fnrf: FuncNodesReactFlow;
}) => (
  <FuncNodesContext.Provider value={fnrf}>
    <IOContext.Provider value={iostore}>{children}</IOContext.Provider>
  </FuncNodesContext.Provider>
);

describe("input renderers", () => {
  it("updates string input values on blur", async () => {
    const setCalls: any[] = [];
    const fnrf = createFnrfContext(setCalls);
    const iostore = createTestIOStore({ value: "Old" });

    render(
      <Providers fnrf={fnrf} iostore={iostore}>
        <StringInput inputconverter={identityConverter} />
      </Providers>
    );

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toBe("Old");

    fireEvent.change(textarea, { target: { value: "New" } });
    fireEvent.blur(textarea);

    await waitFor(() => {
      expect(setCalls.length).toBe(1);
      expect(setCalls[0].value).toBe("New");
    });
  });

  it("renders boolean input as indeterminate when value is undefined", async () => {
    const setCalls: any[] = [];
    const fnrf = createFnrfContext(setCalls);
    const iostore = createTestIOStore({ value: undefined, type: "bool" });

    render(
      <Providers fnrf={fnrf} iostore={iostore}>
        <BooleanInput inputconverter={identityConverter} />
      </Providers>
    );

    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    await waitFor(() => {
      expect(checkbox.indeterminate).toBe(true);
    });

    fireEvent.click(checkbox);
    expect(setCalls.length).toBe(1);
    expect(setCalls[0].value).toBe(true);
  });

  it("clamps number inputs based on min/max", async () => {
    const setCalls: any[] = [];
    const fnrf = createFnrfContext(setCalls);
    const iostore = createTestIOStore({
      value: 1,
      type: "float",
      value_options: { min: 0, max: 10, step: 1 },
    });

    render(
      <Providers fnrf={fnrf} iostore={iostore}>
        <NumberInput inputconverter={identityConverter} parser={parseFloat} />
      </Providers>
    );

    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "12" } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(setCalls.length).toBe(1);
      expect(setCalls[0].value).toBe(10);
      expect(input.value).toBe("10");
    });

    expect(document.querySelector(".SliderRoot")).toBeInTheDocument();
  });

  it("renders float and integer inputs", () => {
    const setCalls: any[] = [];
    const fnrf = createFnrfContext(setCalls);
    const iostore = createTestIOStore({ value: 2, type: "float" });

    const { rerender } = render(
      <Providers fnrf={fnrf} iostore={iostore}>
        <FloatInput inputconverter={identityConverter} />
      </Providers>
    );

    expect(screen.getByRole("textbox")).toBeInTheDocument();

    const intStore = createTestIOStore({ value: 3, type: "int" });
    rerender(
      <Providers fnrf={fnrf} iostore={intStore}>
        <IntegerInput inputconverter={identityConverter} />
      </Providers>
    );

    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders selection input options and updates value", async () => {
    const setCalls: any[] = [];
    const fnrf = createFnrfContext(setCalls);
    const iostore = createTestIOStore({
      value: "Option 2",
      type: "enum",
      value_options: { options: ["Option 1", "Option 2"] },
    });

    render(
      <Providers fnrf={fnrf} iostore={iostore}>
        <SelectionInput inputconverter={identityConverter} />
      </Providers>
    );

    expect(screen.getByText("Option 2")).toBeInTheDocument();

    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "ArrowDown", code: "ArrowDown" });

    await waitFor(() => {
      expect(screen.getByText("Option 1")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Option 1"));

    await waitFor(() => {
      expect(setCalls.length).toBe(1);
      expect(setCalls[0].value).toBe("Option 1");
    });
  });
});
