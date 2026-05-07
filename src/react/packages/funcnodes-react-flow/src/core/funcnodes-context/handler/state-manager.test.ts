import { describe, expect, it, vi } from "vitest";

import { DEFAULT_FN_PROPS } from "@/app";
import { FuncNodesReactFlow } from "../core";

const makeFlow = () =>
  new FuncNodesReactFlow({
    ...DEFAULT_FN_PROPS,
    id: "active-nodespace-test",
    useWorkerManager: false,
  });

const makeWorker = (uuid: string) =>
  ({
    uuid,
    state: {
      subscribe: vi.fn(() => vi.fn()),
      getState: vi.fn(() => ({ is_open: true })),
    },
    set_zustand: vi.fn(),
  } as any);

describe("active nodespace path state", () => {
  it("starts at the root nodespace", () => {
    const flow = makeFlow();

    expect(flow.active_nodespace_path).toEqual([]);
    expect(flow.getStateManager().active_nodespace.getState().loading).toBe(
      false
    );
  });

  it("pushes group entries when entering nested groups", () => {
    const flow = makeFlow();

    flow.enter_group_nodespace("group-1", "Group One");
    flow.enter_group_nodespace("group-2", "Group Two");

    expect(flow.active_nodespace_path).toEqual([
      { groupNodeId: "group-1", label: "Group One" },
      { groupNodeId: "group-2", label: "Group Two" },
    ]);
  });

  it("truncates the path to root or an ancestor", () => {
    const flow = makeFlow();
    flow.enter_group_nodespace("group-1", "Group One");
    flow.enter_group_nodespace("group-2", "Group Two");

    flow.go_to_nodespace_path_index(0);
    expect(flow.active_nodespace_path).toEqual([
      { groupNodeId: "group-1", label: "Group One" },
    ]);

    flow.go_to_nodespace_path_index(-1);
    expect(flow.active_nodespace_path).toEqual([]);
  });

  it("leaves one group level at a time", () => {
    const flow = makeFlow();
    flow.enter_group_nodespace("group-1", "Group One");
    flow.enter_group_nodespace("group-2", "Group Two");

    flow.leave_group_nodespace();

    expect(flow.active_nodespace_path).toEqual([
      { groupNodeId: "group-1", label: "Group One" },
    ]);
  });

  it("resets the active path when clearing the nodespace", () => {
    const flow = makeFlow();
    flow.enter_group_nodespace("group-1", "Group One");

    flow.clear_all();

    expect(flow.active_nodespace_path).toEqual([]);
  });

  it("resets the active path when replacing the worker", () => {
    const flow = makeFlow();
    flow.enter_group_nodespace("group-1", "Group One");

    flow.set_worker(makeWorker("worker-1"));

    expect(flow.active_nodespace_path).toEqual([]);
  });

  it("saves and restores viewports per path", () => {
    const flow = makeFlow();
    const getViewport = vi
      .fn()
      .mockReturnValueOnce({ x: 10, y: 20, zoom: 1.5 })
      .mockReturnValueOnce({ x: 30, y: 40, zoom: 0.75 });
    const setViewport = vi.fn();
    flow.rf_instance = { getViewport, setViewport } as any;

    flow.enter_group_nodespace("group-1", "Group One");
    expect(
      flow.getStateManager().active_nodespace.getState().viewportByPath[""]
    ).toEqual({ x: 10, y: 20, zoom: 1.5 });

    flow.go_to_nodespace_path_index(-1);

    expect(
      flow.getStateManager().active_nodespace.getState().viewportByPath[
        "group-1"
      ]
    ).toEqual({ x: 30, y: 40, zoom: 0.75 });
    expect(setViewport).toHaveBeenCalledWith({ x: 10, y: 20, zoom: 1.5 });
  });

  it("syncs the active nodespace through the current worker", async () => {
    const flow = makeFlow();
    const sync_active_nodespace = vi.fn().mockResolvedValue(undefined);
    const worker = makeWorker("worker-1");
    worker.getSyncManager = vi.fn(() => ({ sync_active_nodespace }));
    flow.set_worker(worker);
    flow.enter_group_nodespace("group-1", "Group One");

    await flow.sync_active_nodespace();

    expect(sync_active_nodespace).toHaveBeenCalledWith([
      { groupNodeId: "group-1", label: "Group One" },
    ]);
  });
});
