import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { create } from "zustand";

import { FuncNodesContext } from "@/providers";
import type { FuncNodesReactFlow } from "@/funcnodes-context";
import { initialRenderMappings } from "../providers/render-mappings/render-mappings.reducer";
import { RenderMappingContext } from "../providers/render-mappings/render-mappings.provider";
import { useDataOverlayRendererForIo } from "./data_renderer_overlay";
import type { IOType } from "@/nodes-core";

const createFnrfContext = (typemap: Record<string, string | undefined>) => {
  const local_state = create(() => ({ reactflowRef: null }));
  const render_options = create(() => ({ typemap }));

  return {
    local_state,
    render_options,
  } as unknown as FuncNodesReactFlow;
};

const HookHarness = ({ io }: { io?: IOType }) => {
  const Renderer = useDataOverlayRendererForIo(io);
  if (!Renderer) return <div>none</div>;
  return <Renderer value={{ test: "value" }} />;
};

const baseContextValue = {
  ...initialRenderMappings,
  extendInputRenderMapping: (_type: string, _component: any, _options?: any) => {},
  extendOutputRenderMapping: (_type: string, _component: any, _options?: any) => {},
  extendHandlePreviewRenderMapping: (
    _type: string,
    _component: any,
    _options?: any
  ) => {},
  extendDataOverlayRenderMapping: (
    _type: string,
    _component: any,
    _options?: any
  ) => {},
  extendDataPreviewRenderMapping: (
    _type: string,
    _component: any,
    _options?: any
  ) => {},
  extendDataViewRenderMapping: (_type: string, _component: any, _options?: any) => {},
  extendNodeRenderer: (_type: string, _component: any, _options?: any) => {},
  extendNodeHooks: (_type: string, _component: any, _options?: any) => {},
  extendFromPlugin: (_plugin: any, _options?: any) => {},
};

describe("useDataOverlayRendererForIo", () => {
  it("returns undefined when io is missing", () => {
    const fnrf = createFnrfContext({});

    render(
      <FuncNodesContext.Provider value={fnrf}>
        <RenderMappingContext.Provider value={baseContextValue}>
          <HookHarness io={undefined} />
        </RenderMappingContext.Provider>
      </FuncNodesContext.Provider>
    );

    expect(screen.getByText("none")).toBeInTheDocument();
  });

  it("uses overlay renderer when available", () => {
    const fnrf = createFnrfContext({ custom: "custom" });
    const overlayRenderer = () => <div>overlay</div>;

    render(
      <FuncNodesContext.Provider value={fnrf}>
        <RenderMappingContext.Provider
          value={{
            ...baseContextValue,
            DataOverlayRenderer: { custom: overlayRenderer },
          }}
        >
          <HookHarness
            io={{
              id: "io",
              name: "IO",
              node: "node",
              full_id: "node.io",
              is_input: true,
              connected: false,
              does_trigger: false,
              hidden: false,
              emit_value_set: false,
              required: false,
              type: "custom",
              render_options: {
                set_default: true,
                type: "custom",
              },
            } as IOType}
          />
        </RenderMappingContext.Provider>
      </FuncNodesContext.Provider>
    );

    expect(screen.getByText("overlay")).toBeInTheDocument();
  });

  it("falls back to data view renderers when overlay mapping is missing", () => {
    const fnrf = createFnrfContext({ image: "image" });
    const viewRenderer = ({ value }: { value?: unknown }) => (
      <div>view:{String(value ? "ok" : "")}</div>
    );

    render(
      <FuncNodesContext.Provider value={fnrf}>
        <RenderMappingContext.Provider
          value={{
            ...baseContextValue,
            DataOverlayRenderer: {},
            DataViewRenderer: { image: viewRenderer },
          }}
        >
          <HookHarness
            io={{
              id: "io",
              name: "IO",
              node: "node",
              full_id: "node.io",
              is_input: true,
              connected: false,
              does_trigger: false,
              hidden: false,
              emit_value_set: false,
              required: false,
              type: "image",
              render_options: {
                set_default: true,
                type: "image",
              },
            } as IOType}
          />
        </RenderMappingContext.Provider>
      </FuncNodesContext.Provider>
    );

    expect(screen.getByText("view:ok")).toBeInTheDocument();
  });

  it("falls back to the default overlay renderer when no type matches", () => {
    const fnrf = createFnrfContext({});

    render(
      <FuncNodesContext.Provider value={fnrf}>
        <RenderMappingContext.Provider value={baseContextValue}>
          <HookHarness
            io={{
              id: "io",
              name: "IO",
              node: "node",
              full_id: "node.io",
              is_input: true,
              connected: false,
              does_trigger: false,
              hidden: false,
              emit_value_set: false,
              required: false,
              type: "custom",
              render_options: {
                set_default: true,
                type: { anyOf: ["image"] },
              },
            } as IOType}
          />
        </RenderMappingContext.Provider>
      </FuncNodesContext.Provider>
    );

    const container = document.querySelector(".json-display");
    expect(container).toBeInTheDocument();
  });
});
