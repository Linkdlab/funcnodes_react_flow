// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";

import { WorkerManager } from "./worker-manager";

const makeWorkerManager = ({
  worker,
  clear_all = vi.fn(),
}: {
  worker?: { uuid: string };
  clear_all?: ReturnType<typeof vi.fn>;
} = {}) => {
  const zustand = {
    worker,
    clear_all,
    set_worker: vi.fn(),
    set_progress: vi.fn(),
    auto_progress: vi.fn(),
    workers: { setState: vi.fn() },
    options: {},
    logger: {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
  };
  const manager = new WorkerManager("ws://localhost:9380", zustand as any);
  clearTimeout((manager as any).connectionTimeout);
  return { manager, zustand };
};

describe("WorkerManager", () => {
  it("sends manager stop and clears the active local worker", async () => {
    const send = vi.fn();
    const clear_all = vi.fn();
    const { manager } = makeWorkerManager({
      worker: { uuid: "worker-1" },
      clear_all,
    });
    (manager as any).ws = { send };
    window.localStorage.setItem("funcnodes__active_worker", "worker-1");

    await manager.stop_worker("worker-1");

    expect(send).toHaveBeenCalledWith(
      JSON.stringify({ type: "stop_worker", workerid: "worker-1" })
    );
    expect(window.localStorage.getItem("funcnodes__active_worker")).toBeNull();
    expect(clear_all).toHaveBeenCalled();
  });
});
