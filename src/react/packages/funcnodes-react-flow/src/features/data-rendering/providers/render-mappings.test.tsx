import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { create } from "zustand";

import {
  renderMappingReducer,
  initialRenderMappings,
} from "./render-mappings/render-mappings.reducer";
import {
  RenderMappingProvider,
  RenderMappingContext,
} from "./render-mappings/render-mappings.provider";
import type { RendererPlugin, FuncNodesReactPlugin } from "@/plugins";
import type { FuncNodesReactFlow } from "@/funcnodes-context";

const DummyRenderer = () => <div>custom</div>;
const DummyNodeRenderer = () => <div>node</div>;
const DummyHook = () => <div>hook</div>;

const cloneRenderState = () => ({
  ...initialRenderMappings,
  Inputrenderer: { ...initialRenderMappings.Inputrenderer },
  Outputrenderer: { ...initialRenderMappings.Outputrenderer },
  HandlePreviewRenderer: { ...initialRenderMappings.HandlePreviewRenderer },
  DataOverlayRenderer: { ...initialRenderMappings.DataOverlayRenderer },
  DataPreviewViewRenderer: { ...initialRenderMappings.DataPreviewViewRenderer },
  DataViewRenderer: { ...initialRenderMappings.DataViewRenderer },
  InLineRenderer: { ...initialRenderMappings.InLineRenderer },
  NodeRenderer: { ...initialRenderMappings.NodeRenderer },
  NodeHooks: { ...initialRenderMappings.NodeHooks },
});

const createFnrfContext = (): FuncNodesReactFlow => {
  const local_state = create(() => ({ reactflowRef: null }));
  const render_options = create(() => ({}));

  return {
    local_state,
    render_options,
  } as unknown as FuncNodesReactFlow;
};

describe("render mapping reducer", () => {
  it("extends input renderers", () => {
    const state = cloneRenderState();
    const next = renderMappingReducer(state, {
      type: "EXTEND_INPUT_RENDER",
      payload: { type: "custom", component: DummyRenderer },
    });

    expect(next.Inputrenderer.custom).toBe(DummyRenderer);
  });

  it("respects overwrite false for existing mappings", () => {
    const state = cloneRenderState();
    const next = renderMappingReducer(state, {
      type: "EXTEND_INPUT_RENDER",
      payload: { type: "string", component: DummyRenderer },
      options: { overwrite: false },
    });

    expect(next).toBe(state);
  });

  it("extends output renderers through the key map", () => {
    const state = cloneRenderState();
    const next = renderMappingReducer(state, {
      type: "EXTEND_OUTPUT_RENDER",
      payload: { type: "custom", component: DummyRenderer },
    });

    expect(next.Outputrenderer.custom).toBe(DummyRenderer);
  });

  it("extends from renderer plugins when new mappings exist", () => {
    const state = cloneRenderState();
    const plugin: RendererPlugin = {
      input_renderers: { custom: DummyRenderer },
      node_renderers: { node: DummyNodeRenderer },
      node_hooks: { node: [DummyHook] },
    };

    const next = renderMappingReducer(state, {
      type: "EXTEND_FROM_PLUGIN",
      payload: { plugin },
    });

    expect(next.Inputrenderer.custom).toBe(DummyRenderer);
    expect(next.NodeRenderer.node).toBe(DummyNodeRenderer);
    expect(next.NodeHooks.node).toEqual([DummyHook]);
  });

  it("returns existing state when plugin adds nothing", () => {
    const state = cloneRenderState();
    const plugin = {} as RendererPlugin;
    const next = renderMappingReducer(state, {
      type: "EXTEND_FROM_PLUGIN",
      payload: { plugin },
      options: { overwrite: false },
    });

    expect(next).toBe(state);
  });
});

describe("RenderMappingProvider", () => {
  it("exposes extend helpers", async () => {
    const fnrf = createFnrfContext();

    const Consumer = () => {
      const { Inputrenderer, extendInputRenderMapping } =
        React.useContext(RenderMappingContext);

      React.useEffect(() => {
        extendInputRenderMapping("custom", DummyRenderer, {});
      }, [extendInputRenderMapping]);

      return <div>{Inputrenderer.custom ? "added" : "missing"}</div>;
    };

    render(
      <RenderMappingProvider plugins={{}} fnrf_zst={fnrf}>
        <Consumer />
      </RenderMappingProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("added")).toBeInTheDocument();
    });
  });

  it("integrates renderer plugins", async () => {
    const fnrf = createFnrfContext();
    const plugin: FuncNodesReactPlugin = {
      v: "1.0.0",
      renderpluginfactory: () => ({
        input_renderers: { plugin: DummyRenderer },
      }),
    } as FuncNodesReactPlugin;

    const Consumer = () => {
      const { Inputrenderer } = React.useContext(RenderMappingContext);
      return <div>{Inputrenderer.plugin ? "plugin" : "missing"}</div>;
    };

    render(
      <RenderMappingProvider plugins={{ plugin }} fnrf_zst={fnrf}>
        <Consumer />
      </RenderMappingProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("plugin")).toBeInTheDocument();
    });
  });
});
