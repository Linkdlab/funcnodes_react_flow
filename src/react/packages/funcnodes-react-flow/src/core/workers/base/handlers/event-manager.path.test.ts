import { describe, expect, it, vi } from "vitest";

import { WorkerEventManager } from "./event-manager";
import type { NodeSpacePath } from "@/funcnodes-context";

const GROUP_PATH: NodeSpacePath = [
  { groupNodeId: "group-node", label: "Group Node" },
];

const OTHER_PATH: NodeSpacePath = [
  { groupNodeId: "other-group", label: "Other Group" },
];

/** Creates a path-aware event manager with minimal worker state. */
const makeEventManager = (activePath: NodeSpacePath = GROUP_PATH) => {
  const nodeActions: any[] = [];
  const edgeActions: any[] = [];
  const syncActiveNodeSpace = vi.fn().mockResolvedValue(undefined);
  let activeNodeSpaceState: any = {
    path: activePath,
    stalePathKeys: {},
  };
  const active_nodespace = {
    getState: () => activeNodeSpaceState,
    setState: (partial: any) => {
      activeNodeSpaceState = { ...activeNodeSpaceState, ...partial };
    },
  };
  const worker = {
    _zustand: {
      active_nodespace,
      on_node_action: (action: any) => {
        nodeActions.push(action);
      },
      on_edge_action: (action: any) => {
        edgeActions.push(action);
      },
      lib: {
        libstate: {
          getState: () => ({ set: vi.fn() }),
        },
      },
    },
    getHookManager: () => ({ call_hooks: vi.fn() }),
    getSyncManager: () => ({ sync_active_nodespace: syncActiveNodeSpace }),
  };
  return {
    manager: new WorkerEventManager({ worker } as any),
    nodeActions,
    edgeActions,
    syncActiveNodeSpace,
    active_nodespace,
  };
};

describe("WorkerEventManager path-aware nodespace events", () => {
  it("ignores bubbled inner request-trigger events without warning", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { manager, nodeActions, active_nodespace } =
      makeEventManager(GROUP_PATH);

    try {
      await manager.receive_nodespace_event({
        type: "nsevent",
        event: "inner_after_request_trigger",
        data: {
          path: GROUP_PATH,
          parent_path: [],
          node: "group-node",
          inner_node: "inner-node",
          inner_event: "after_request_trigger",
          result: null,
        },
      });
    } finally {
      warn.mockRestore();
    }

    expect(nodeActions).toEqual([]);
    expect(active_nodespace.getState().stalePathKeys).toEqual({});
    expect(warn).not.toHaveBeenCalled();
  });

  it("routes inner node trigger errors to the displayed internal node when active path matches", async () => {
    const { manager, nodeActions } = makeEventManager(GROUP_PATH);

    await manager.receive_nodespace_event({
      type: "nsevent",
      event: "inner_node_trigger_error",
      data: {
        path: GROUP_PATH,
        parent_path: [],
        node: "group-node",
        inner_node: "inner-node",
        inner_event: "node_trigger_error",
        error: "boom",
        tb: ["traceback"],
      },
    });

    expect(nodeActions).toEqual([
      {
        type: "error",
        errortype: "trigger",
        error: "boom",
        id: "inner-node",
        tb: ["traceback"],
        from_remote: true,
      },
    ]);
  });

  it("routes bubbled inner errors to the outer group node in the parent view", async () => {
    const { manager, nodeActions } = makeEventManager([]);

    await manager.receive_nodespace_event({
      type: "nsevent",
      event: "inner_node_trigger_error",
      data: {
        path: GROUP_PATH,
        parent_path: [],
        node: "group-node",
        inner_node: "inner-node",
        inner_event: "node_trigger_error",
        error: "boom",
        tb: ["traceback"],
      },
    });

    expect(nodeActions[0]).toMatchObject({
      type: "error",
      id: "group-node",
      error: "boom",
    });
  });

  it("updates IO values only when the event path matches the active group view", async () => {
    const { manager, nodeActions } = makeEventManager(GROUP_PATH);

    await manager.receive_nodespace_event({
      type: "nsevent",
      event: "after_set_value",
      data: {
        path: GROUP_PATH,
        node: "inner-node",
        io: "out",
        result: 42,
      },
    });

    expect(nodeActions[0]).toMatchObject({
      type: "update",
      id: "inner-node",
      node: { id: "inner-node", io: { out: { value: 42 } } },
    });
  });

  it("marks inactive event paths stale without mutating the current React Flow state", async () => {
    const { manager, nodeActions, active_nodespace } =
      makeEventManager(GROUP_PATH);

    await manager.receive_nodespace_event({
      type: "nsevent",
      event: "after_set_value",
      data: {
        path: OTHER_PATH,
        node: "other-node",
        io: "out",
        result: 7,
      },
    });

    expect(nodeActions).toEqual([]);
    expect(active_nodespace.getState().stalePathKeys).toEqual({
      "other-group": true,
    });
  });

  it("resyncs conservatively when pathless events arrive while editing a group", async () => {
    const { manager, nodeActions, syncActiveNodeSpace } =
      makeEventManager(GROUP_PATH);

    await manager.receive_nodespace_event({
      type: "nsevent",
      event: "triggerstart",
      data: { node: "root-node" },
    });

    expect(nodeActions).toEqual([]);
    expect(syncActiveNodeSpace).toHaveBeenCalledWith(GROUP_PATH);
  });
});
