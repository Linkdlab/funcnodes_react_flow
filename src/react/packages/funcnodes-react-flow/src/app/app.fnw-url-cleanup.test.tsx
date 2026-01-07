import { describe, it, expect, vi } from "vitest";
import * as React from "react";
import { act, render, waitFor } from "@testing-library/react";

import { FuncNodes } from "@/app";
import { FuncNodesWorker } from "@/workers";

vi.mock("@/data-helpers", () => ({
  remoteUrlToBase64: vi.fn(async () => "base64:dummy"),
}));

import { remoteUrlToBase64 } from "@/data-helpers";

describe("FuncNodes (fnw_url cleanup)", () => {
  it("removes the queued fnw_url import callback on unmount", async () => {
    const worker = new FuncNodesWorker({ uuid: "worker-1" });

    const { unmount } = render(
      <div style={{ height: 600, width: 800 }}>
        <FuncNodes
          id="test"
          useWorkerManager={false}
          worker={worker}
          fnw_url="https://example.invalid/test.fnw"
          header={{ show: false, showmenu: false }}
          library={{ show: false }}
          flow={{
            minimap: false,
            static: true,
            minZoom: 0.1,
            maxZoom: 2,
            allowFullScreen: false,
            allowExpand: false,
            showNodeSettings: false,
          }}
        />
      </div>
    );

    const syncManager: any = worker.getSyncManager();

    await waitFor(() => {
      expect(remoteUrlToBase64).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(syncManager._after_next_sync?.length).toBe(1);
    });

    act(() => unmount());

    expect(syncManager._after_next_sync?.length).toBe(0);

    worker.getSyncManager().stop();
    worker.getConnectionHealthManager().stop();
    worker.getCommunicationManager().stop();
  });
});
