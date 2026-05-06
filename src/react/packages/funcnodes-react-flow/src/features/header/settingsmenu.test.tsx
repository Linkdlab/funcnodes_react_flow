import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

import { FuncNodesContext } from "@/providers";
import { SettingsMenu } from "./settingsmenu";

const makeWorkersStore = (workers: Record<string, any>) => {
  const store = vi.fn(() => workers) as any;
  store.setState = vi.fn((updater) => {
    const next = typeof updater === "function" ? updater(workers) : updater;
    Object.keys(workers).forEach((key) => delete workers[key]);
    Object.assign(workers, next);
  });
  return store;
};

const renderSettingsMenu = ({
  worker,
  workerOpen,
  workers,
}: {
  worker?: any;
  workerOpen: boolean;
  workers: Record<string, any>;
}) => {
  const context = {
    worker,
    workerstate: vi.fn(() => ({ is_open: workerOpen })),
    workers: makeWorkersStore(workers),
    local_state: vi.fn((selector) =>
      selector({ funcnodescontainerRef: undefined })
    ),
    logger: {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
  } as any;

  render(
    <FuncNodesContext.Provider value={context}>
      <SettingsMenu />
    </FuncNodesContext.Provider>
  );

  return context;
};

describe("SettingsMenu worker settings", () => {
  it("does not render Worker without a connected worker", async () => {
    const user = userEvent.setup();
    renderSettingsMenu({ workerOpen: false, workers: {} });

    await user.click(screen.getByRole("button", { name: /settings/i }));

    expect(screen.queryByText("Worker")).not.toBeInTheDocument();
  });

  it("opens worker settings for a connected worker", async () => {
    const user = userEvent.setup();
    const worker = {
      uuid: "worker-1",
      is_open: true,
      get_config: vi.fn(async () => ({
        uuid: "worker-1",
        type: "WSWorker",
        host: "localhost",
        port: 9381,
        name: "primary",
        autostart: "unless-stopped",
        update_on_startup: { funcnodes: true },
      })),
      update_settings: vi.fn(),
    };

    renderSettingsMenu({
      worker,
      workerOpen: true,
      workers: {
        "worker-1": {
          uuid: "worker-1",
          host: "localhost",
          port: 9381,
          ssl: false,
          active: true,
          open: true,
          name: "primary",
          autostart: "unless-stopped",
        },
      },
    });

    await user.click(screen.getByRole("button", { name: /settings/i }));
    await user.click(screen.getByText("Worker"));

    expect(
      await screen.findByRole("dialog", { name: "Worker" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveValue("primary");
    expect(screen.getByLabelText("Autostart")).toHaveValue("unless-stopped");
  });

  it("saves edited worker settings", async () => {
    const user = userEvent.setup();
    const worker = {
      uuid: "worker-1",
      is_open: true,
      get_config: vi.fn(async () => ({
        uuid: "worker-1",
        name: "primary",
        autostart: "never",
        update_on_startup: { funcnodes: true },
      })),
      update_settings: vi.fn(async (settings) => ({
        uuid: "worker-1",
        ...settings,
      })),
    };

    const context = renderSettingsMenu({
      worker,
      workerOpen: true,
      workers: {
        "worker-1": {
          uuid: "worker-1",
          name: "primary",
          active: true,
          open: true,
        },
      },
    });

    await user.click(screen.getByRole("button", { name: /settings/i }));
    await user.click(screen.getByText("Worker"));
    const nameInput = await screen.findByLabelText("Name");
    await user.clear(nameInput);
    await user.type(nameInput, "renamed");
    await user.selectOptions(screen.getByLabelText("Autostart"), "always");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(worker.update_settings).toHaveBeenCalledWith(
        expect.objectContaining({ name: "renamed", autostart: "always" })
      );
      expect(context.workers.setState).toHaveBeenCalled();
    });
  });

  it("saves update-on-startup checkbox changes", async () => {
    const user = userEvent.setup();
    const worker = {
      uuid: "worker-1",
      is_open: true,
      get_config: vi.fn(async () => ({
        uuid: "worker-1",
        name: "primary",
        autostart: "never",
        update_on_startup: { funcnodes: true },
      })),
      update_settings: vi.fn(async (settings) => ({
        uuid: "worker-1",
        ...settings,
      })),
    };

    renderSettingsMenu({
      worker,
      workerOpen: true,
      workers: {
        "worker-1": {
          uuid: "worker-1",
          name: "primary",
          active: true,
          open: true,
          update_on_startup: { funcnodes: true },
        },
      },
    });

    await user.click(screen.getByRole("button", { name: /settings/i }));
    await user.click(screen.getByText("Worker"));
    const updateCheckbox = await screen.findByLabelText("funcnodes");
    await user.click(updateCheckbox);
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(worker.update_settings).toHaveBeenCalledWith(
        expect.objectContaining({
          update_on_startup: expect.objectContaining({ funcnodes: false }),
        })
      );
    });
  });

  it("normalizes stale boolean autostart config from workers", async () => {
    const user = userEvent.setup();
    const worker = {
      uuid: "worker-1",
      is_open: true,
      get_config: vi.fn(async () => ({
        uuid: "worker-1",
        name: "primary",
        autostart: true,
        update_on_startup: {},
      })),
      update_settings: vi.fn(),
    };

    renderSettingsMenu({
      worker,
      workerOpen: true,
      workers: {
        "worker-1": {
          uuid: "worker-1",
          name: "primary",
          active: true,
          open: true,
          autostart: false,
        },
      },
    });

    await user.click(screen.getByRole("button", { name: /settings/i }));
    await user.click(screen.getByText("Worker"));

    expect(await screen.findByLabelText("Autostart")).toHaveValue(
      "unless-stopped"
    );
  });
});
