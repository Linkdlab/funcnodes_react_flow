import { describe, it, expect } from "vitest";
import * as React from "react";
import { act, render } from "@testing-library/react";

import { FuncNodesContext } from "@/providers";
import { Library } from "@/library";
import { FuncNodesReactFlow } from "@/funcnodes-context";
import { DEFAULT_FN_PROPS } from "@/app";
import { FuncNodesWorker } from "@/workers";
import { SizeContextContainer } from "@/shared-components/auto-layouts";

describe("Library (worker stop)", () => {
  it("does not crash when the worker disappears after a worker state update", () => {
    const fnrf_zst = new FuncNodesReactFlow({
      ...DEFAULT_FN_PROPS,
      id: "test",
      useWorkerManager: false,
    });

    const worker = new FuncNodesWorker({ uuid: "worker-1" });
    worker.set_zustand(fnrf_zst);

    render(
      <SizeContextContainer>
        <FuncNodesContext.Provider value={fnrf_zst}>
          <Library />
        </FuncNodesContext.Provider>
      </SizeContextContainer>
    );

    expect(() => {
      act(() => {
        // Simulate: the app clears the worker reference and triggers any UI state update.
        fnrf_zst.set_worker(undefined);
        fnrf_zst.update_view_settings({ expand_lib: true });
      });
    }).not.toThrow();

    worker.getSyncManager().stop();
    worker.getConnectionHealthManager().stop();
    worker.getCommunicationManager().stop();
  });
});
