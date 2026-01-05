import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import {
  DataViewRendererToOverlayRenderer,
  DataViewRendererToDataPreviewViewRenderer,
  DataPreviewViewRendererToHandlePreviewRenderer,
  DataViewRendererToInputRenderer,
} from "./renderer-converter";
import { IOContext } from "@/nodes";
import { createIOStore } from "@/nodes-core";

const createTestIOStore = (
  value: string | number | boolean | undefined,
  fullvalue?: string | number | boolean
) =>
  createIOStore("node-1", {
    id: "io-1",
    name: "IO",
    node: "node-1",
    full_id: "node-1.io-1",
    is_input: true,
    type: "string",
    render_options: {
      set_default: true,
      type: "string",
    },
    value,
    fullvalue,
  });

describe("renderer converter utilities", () => {
  it("wraps a data view renderer as an overlay renderer", async () => {
    let loadedCount = 0;
    const DataView = ({ value, preValue, onLoaded }: {
      value: unknown;
      preValue?: unknown;
      onLoaded?: () => void;
    }) => {
      React.useEffect(() => {
        onLoaded?.();
      }, [onLoaded]);
      return (
        <div>
          {String(value)}|{String(preValue)}
        </div>
      );
    };

    const Overlay = DataViewRendererToOverlayRenderer(DataView);
    render(
      <Overlay
        value="value"
        preValue="pre"
        onLoaded={() => {
          loadedCount += 1;
        }}
      />
    );

    expect(screen.getByText("value|pre")).toBeInTheDocument();
    await waitFor(() => {
      expect(loadedCount).toBe(1);
    });
  });

  it("uses preview value when full value is undefined", () => {
    const DataView = ({ value }: { value: unknown }) => (
      <div>{String(value)}</div>
    );
    const PreviewRenderer = DataViewRendererToDataPreviewViewRenderer(
      DataView,
      "fallback"
    );

    const iostore = createTestIOStore("preview");
    render(
      <IOContext.Provider value={iostore}>
        <PreviewRenderer />
      </IOContext.Provider>
    );

    expect(screen.getByText("preview")).toBeInTheDocument();
  });

  it("uses full value when available", () => {
    const DataView = ({ value }: { value: unknown }) => (
      <div>{String(value)}</div>
    );
    const PreviewRenderer = DataViewRendererToDataPreviewViewRenderer(
      DataView,
      "fallback"
    );

    const iostore = createTestIOStore("preview", "full");
    render(
      <IOContext.Provider value={iostore}>
        <PreviewRenderer />
      </IOContext.Provider>
    );

    expect(screen.getByText("full")).toBeInTheDocument();
  });

  it("falls back to the provided default value", () => {
    const DataView = ({ value }: { value: unknown }) => (
      <div>{String(value)}</div>
    );
    const PreviewRenderer = DataViewRendererToDataPreviewViewRenderer(
      DataView,
      "fallback"
    );

    const iostore = createTestIOStore(undefined, undefined);
    render(
      <IOContext.Provider value={iostore}>
        <PreviewRenderer />
      </IOContext.Provider>
    );

    expect(screen.getByText("fallback")).toBeInTheDocument();
  });

  it("wraps a preview renderer as a handle preview renderer", () => {
    const PreviewRenderer = () => <div>preview</div>;
    const HandleRenderer =
      DataPreviewViewRendererToHandlePreviewRenderer(PreviewRenderer);

    render(<HandleRenderer />);

    expect(screen.getByText("preview")).toBeInTheDocument();
  });

  it("wraps a data view renderer as an input renderer", () => {
    const DataView = ({ value }: { value: unknown }) => (
      <div>{String(value)}</div>
    );
    const InputRenderer = DataViewRendererToInputRenderer(DataView, "fallback");

    const iostore = createTestIOStore("preview");
    render(
      <IOContext.Provider value={iostore}>
        <InputRenderer inputconverter={[(v) => v, (v) => v]} />
      </IOContext.Provider>
    );

    expect(screen.getByText("preview")).toBeInTheDocument();
  });
});
