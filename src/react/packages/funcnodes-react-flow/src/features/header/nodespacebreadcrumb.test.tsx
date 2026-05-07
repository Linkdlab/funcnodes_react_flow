import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

import { DEFAULT_FN_PROPS } from "@/app";
import { FuncNodesReactFlow } from "@/funcnodes-context";
import { FuncNodesContext } from "@/providers";
import { NodeSpaceBreadcrumb } from "./nodespacebreadcrumb";
import { NodeSpaceMenu } from "./nodespacemenu";

const makeFlow = () => {
  const flow = new FuncNodesReactFlow({
    ...DEFAULT_FN_PROPS,
    id: "nodespace-breadcrumb-test",
    useWorkerManager: false,
  });
  vi.spyOn(flow, "sync_active_nodespace").mockResolvedValue(undefined);
  return flow;
};

const renderWithFlow = (flow: FuncNodesReactFlow, element: React.ReactNode) =>
  render(
    <FuncNodesContext.Provider value={flow}>{element}</FuncNodesContext.Provider>
  );

describe("NodeSpaceBreadcrumb", () => {
  it("displays Root for the root nodespace", () => {
    const flow = makeFlow();

    renderWithFlow(flow, <NodeSpaceBreadcrumb />);

    expect(screen.getByRole("button", { name: "Root" })).toBeInTheDocument();
  });

  it("displays group labels in order for nested paths", () => {
    const flow = makeFlow();
    flow.set_nodespace_path([
      { groupNodeId: "group-1", label: "Group One" },
      { groupNodeId: "group-2", label: "Nested Group" },
    ]);

    renderWithFlow(flow, <NodeSpaceBreadcrumb />);

    expect(screen.getByRole("button", { name: "Root" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Group One" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Nested Group" })
    ).toBeInTheDocument();
  });

  it("clicking Root returns to the root nodespace and syncs", async () => {
    const user = userEvent.setup();
    const flow = makeFlow();
    flow.set_nodespace_path([{ groupNodeId: "group-1", label: "Group One" }]);

    renderWithFlow(flow, <NodeSpaceBreadcrumb />);
    await user.click(screen.getByRole("button", { name: "Root" }));

    expect(flow.active_nodespace.getState().path).toEqual([]);
    expect(flow.sync_active_nodespace).toHaveBeenCalledTimes(1);
  });

  it("clicking an ancestor returns to that nested nodespace and syncs", async () => {
    const user = userEvent.setup();
    const flow = makeFlow();
    flow.set_nodespace_path([
      { groupNodeId: "group-1", label: "Group One" },
      { groupNodeId: "group-2", label: "Nested Group" },
    ]);

    renderWithFlow(flow, <NodeSpaceBreadcrumb />);
    await user.click(screen.getByRole("button", { name: "Group One" }));

    expect(flow.active_nodespace.getState().path).toEqual([
      { groupNodeId: "group-1", label: "Group One" },
    ]);
    expect(flow.sync_active_nodespace).toHaveBeenCalledTimes(1);
  });

  it("updates an active path label when that group node is renamed", async () => {
    const flow = makeFlow();
    flow.set_nodespace_path([{ groupNodeId: "group-1", label: "Group One" }]);

    renderWithFlow(flow, <NodeSpaceBreadcrumb />);
    act(() => {
      flow.on_node_action({
        type: "update",
        id: "group-1",
        node: { name: "Renamed Group" },
        from_remote: true,
      });
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Renamed Group" })
      ).toBeInTheDocument();
    });
  });
});

describe("NodeSpaceMenu active path resets", () => {
  it("new flow clears the breadcrumb back to Root", async () => {
    const user = userEvent.setup();
    const flow = makeFlow();
    flow.set_nodespace_path([{ groupNodeId: "group-1", label: "Group One" }]);
    flow.set_worker({
      uuid: "worker-1",
      is_open: true,
      state: {
        subscribe: vi.fn(() => vi.fn()),
        getState: vi.fn(() => ({ is_open: true })),
      },
      set_zustand: vi.fn(),
      clear: vi.fn(),
    } as any);
    vi.spyOn(window, "confirm").mockReturnValue(true);

    renderWithFlow(
      flow,
      <>
        <NodeSpaceBreadcrumb />
        <NodeSpaceMenu />
      </>
    );
    await user.click(screen.getByRole("button", { name: /nodespace/i }));
    await user.click(await screen.findByText("New"));

    expect(flow.active_nodespace.getState().path).toEqual([]);
    expect(screen.getByRole("button", { name: "Root" })).toBeInTheDocument();
  });

  it("loading a flow clears the breadcrumb back to Root", async () => {
    const user = userEvent.setup();
    const flow = makeFlow();
    const loadedFlow = { nodes: [], edges: [] };
    let createdInput: HTMLInputElement | undefined;
    const realCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tagName) => {
      const element = realCreateElement(tagName);
      if (tagName === "input") {
        createdInput = element as HTMLInputElement;
      }
      return element;
    });
    class MockFileReader {
      onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
      readAsText = vi.fn(() => {
        this.onload?.({
          target: { result: JSON.stringify(loadedFlow) },
        } as unknown as ProgressEvent<FileReader>);
      });
    }
    vi.stubGlobal("FileReader", MockFileReader);
    flow.set_nodespace_path([{ groupNodeId: "group-1", label: "Group One" }]);
    flow.set_worker({
      uuid: "worker-1",
      is_open: true,
      state: {
        subscribe: vi.fn(() => vi.fn()),
        getState: vi.fn(() => ({ is_open: true })),
      },
      set_zustand: vi.fn(),
      load: vi.fn().mockResolvedValue(undefined),
    } as any);

    renderWithFlow(
      flow,
      <>
        <NodeSpaceBreadcrumb />
        <NodeSpaceMenu />
      </>
    );
    await user.click(screen.getByRole("button", { name: /nodespace/i }));
    await user.click(await screen.findByText("Load"));
    await act(async () => {
      createdInput?.onchange?.({
        target: {
          files: [new File(["{}"], "flow.json", { type: "application/json" })],
        },
      } as unknown as Event);
    });

    await waitFor(() => {
      expect(flow.worker?.load).toHaveBeenCalledWith(loadedFlow);
    });
    expect(flow.active_nodespace.getState().path).toEqual([]);
    expect(screen.getByRole("button", { name: "Root" })).toBeInTheDocument();
  });
});
