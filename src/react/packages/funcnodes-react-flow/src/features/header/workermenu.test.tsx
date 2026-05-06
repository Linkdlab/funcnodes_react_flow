import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

import { FuncNodesContext } from "@/providers";
import { WorkerMenu } from "./workermenu";

const makeWorkersStore = (workers: Record<string, any>) => {
  const store = vi.fn(() => workers) as any;
  store.setState = vi.fn();
  return store;
};

describe("WorkerMenu", () => {
  it("stops managed workers through the worker manager", async () => {
    const user = userEvent.setup();
    const worker = {
      uuid: "worker-1",
      is_open: true,
      stop: vi.fn(),
    };
    const workermanager = {
      open: true,
      restart_worker: vi.fn(),
      stop_worker: vi.fn(),
      set_active: vi.fn(),
    };
    const clear_all = vi.fn();

    render(
      <FuncNodesContext.Provider
        value={
          {
            worker,
            workermanager,
            clear_all,
            workers: makeWorkersStore({
              "worker-1": {
                uuid: "worker-1",
                active: true,
                open: true,
                name: "Primary",
              },
            }),
            local_state: vi.fn((selector) =>
              selector({ funcnodescontainerRef: undefined })
            ),
            options: { useWorkerManager: true },
            logger: {
              debug: vi.fn(),
              info: vi.fn(),
              warn: vi.fn(),
              error: vi.fn(),
            },
          } as any
        }
      >
        <WorkerMenu />
      </FuncNodesContext.Provider>
    );

    await user.click(screen.getByRole("button", { name: /worker/i }));
    await user.click(await screen.findByText("Stop"));

    await waitFor(() => {
      expect(workermanager.stop_worker).toHaveBeenCalledWith("worker-1");
    });
    expect(clear_all).not.toHaveBeenCalled();
    expect(worker.stop).not.toHaveBeenCalled();
  });
});
