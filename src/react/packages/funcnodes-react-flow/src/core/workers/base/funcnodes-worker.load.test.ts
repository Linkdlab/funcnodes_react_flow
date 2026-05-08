import { describe, expect, it, vi } from "vitest";

import { loadWorkerData } from "./funcnodes-worker.load";

describe("FuncNodesWorker load", () => {
  it("clears the active nodespace path before syncing loaded data", async () => {
    const resetNodeSpacePath = vi.fn();
    const sendCommand = vi.fn().mockResolvedValue(undefined);
    const fullSync = vi.fn().mockResolvedValue(undefined);

    await loadWorkerData({
      data: { backend: { nodes: [] }, view: {} },
      resetNodeSpacePath,
      sendCommand,
      fullSync,
    });

    expect(resetNodeSpacePath).toHaveBeenCalledOnce();
    expect(sendCommand).toHaveBeenCalledWith({
      cmd: "load_data",
      kwargs: { data: { backend: { nodes: [] }, view: {} } },
      wait_for_response: true,
    });
    expect(fullSync).toHaveBeenCalledOnce();
    expect(resetNodeSpacePath.mock.invocationCallOrder[0]).toBeLessThan(
      sendCommand.mock.invocationCallOrder[0]
    );
    expect(resetNodeSpacePath.mock.invocationCallOrder[0]).toBeLessThan(
      fullSync.mock.invocationCallOrder[0]
    );
  });
});
