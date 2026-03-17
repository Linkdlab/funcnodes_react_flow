import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { create } from "zustand";

import { FuncNodesContext } from "@/providers";
import { IOContext } from "@/nodes";
import { createIOStore } from "@/nodes-core";
import type { FuncNodesReactFlow } from "@/funcnodes-context";
import type {
  DataOverlayRendererProps,
  DataPreviewViewRendererProps,
} from "@/data-rendering-types";
import type { JSONType } from "@/data-structures";
import { JSONStructure } from "@/data-structures";

import { IODataOverlay, IOPreviewWrapper } from "./iodataoverlay";

const createFnrfContext = (): FuncNodesReactFlow => {
  const local_state = create(() => ({ reactflowRef: null }));
  const render_options = create(() => ({}));

  return {
    local_state,
    render_options,
    worker: undefined,
  } as unknown as FuncNodesReactFlow;
};

const createTestIOStore = (fullvalue: Exclude<JSONType, null> | undefined) =>
  createIOStore("node-1", {
    id: "io-1",
    name: "IO",
    node: "node-1",
    full_id: "node-1.io-1",
    is_input: true,
    type: "object",
    render_options: {
      set_default: true,
      type: "object",
    },
    fullvalue:
      fullvalue !== null && typeof fullvalue === "object"
        ? JSONStructure.fromObject(fullvalue)
        : fullvalue,
    connected: false,
    does_trigger: false,
    hidden: false,
    emit_value_set: false,
    required: false,
  });

const Providers = ({
  children,
  iostore,
}: {
  children: React.ReactNode;
  iostore: ReturnType<typeof createTestIOStore>;
}) => (
  <FuncNodesContext.Provider value={createFnrfContext()}>
    <IOContext.Provider value={iostore}>{children}</IOContext.Provider>
  </FuncNodesContext.Provider>
);

const SafeOverlay = ({ value, preValue, onLoaded }: DataOverlayRendererProps) => {
  React.useEffect(() => {
    if (value !== undefined) {
      onLoaded?.();
    }
  }, [onLoaded, value]);

  return (
    <div>
      value:{String((value as { current?: string } | undefined)?.current ?? "none")}
      pre:{String((preValue as { current?: string } | undefined)?.current ?? "none")}
    </div>
  );
};

const InvalidChildOverlay = ({ value }: DataOverlayRendererProps) => {
  return <div>{value as React.ReactNode}</div>;
};

const SafePreview = (_props: DataPreviewViewRendererProps) => {
  return <div>preview-safe</div>;
};

const ThrowingPreview = (_props: DataPreviewViewRendererProps) => {
  throw new Error("preview-boom");
};

describe("IODataOverlay", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("renders the custom overlay and keeps the current value flow intact", async () => {
    const iostore = createTestIOStore({ current: "loaded" });

    render(
      <Providers iostore={iostore}>
        <IODataOverlay Component={SafeOverlay} iostore={iostore} />
      </Providers>
    );

    await waitFor(() => {
      expect(screen.getByText("value:loadedpre:loaded")).toBeInTheDocument();
    });
  });

  it("falls back to the default overlay renderer when the custom renderer throws", async () => {
    const iostore = createTestIOStore({
      np_ratio: 0.5,
      helper_rel: 0.1,
      stealth_rel: 0.9,
      helper_lipid: "DSPC",
      stealth_lipid: "PEG",
    });

    render(
      <Providers iostore={iostore}>
        <IODataOverlay Component={InvalidChildOverlay} iostore={iostore} />
      </Providers>
    );

    await waitFor(() => {
      expect(document.querySelector(".json-display")).toBeInTheDocument();
    });
  });
});

describe("IOPreviewWrapper", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("renders the custom preview renderer when it does not throw", () => {
    const iostore = createTestIOStore({ current: "loaded" });

    render(
      <Providers iostore={iostore}>
        <IOPreviewWrapper Component={SafePreview} />
      </Providers>
    );

    expect(screen.getByText("preview-safe")).toBeInTheDocument();
  });

  it("falls back to the default preview renderer when the custom preview throws", async () => {
    const iostore = createTestIOStore({
      np_ratio: 0.5,
      helper_rel: 0.1,
      stealth_rel: 0.9,
      helper_lipid: "DSPC",
      stealth_lipid: "PEG",
    });

    render(
      <Providers iostore={iostore}>
        <IOPreviewWrapper Component={ThrowingPreview} />
      </Providers>
    );

    await waitFor(() => {
      expect(document.querySelector(".json-display")).toBeInTheDocument();
    });
  });
});
