import { describe, it, expect } from "vitest";

import { WorkerEventManager } from "./event-manager";


describe("WorkerEventManager repos_update", () => {
  it("calls hooks with repos payload", async () => {
    const calls: any[] = [];
    const fakeWorker: any = {
      _zustand: undefined,
      getHookManager() {
        return {
          call_hooks: async (hook: string, data: any) => {
            calls.push({ hook, data });
          },
        };
      },
    };

    const mgr = new WorkerEventManager({ worker: fakeWorker });
    await mgr.receive_workerevent({
      type: "workerevent",
      event: "repos_update",
      data: { repos: { a: 1 } },
    });

    expect(calls.length).toBe(1);
    expect(calls[0].hook).toBe("repos_update");
    expect(calls[0].data).toEqual({ a: 1 });
  });
});
