import { describe, expect, it, vi } from "vitest";

import { WorkerCommunicationManager } from "./communication-manager";
import type { NodeSpacePath } from "@/funcnodes-context";

const GROUP_PATH: NodeSpacePath = [
  { groupNodeId: "group-node", label: "Group Node" },
];

const OTHER_PATH: NodeSpacePath = [
  { groupNodeId: "other-group", label: "Other Group" },
];

/** Creates a communication manager with enough worker state for byte routing. */
const makeCommunicationManager = (activePath: NodeSpacePath = GROUP_PATH) => {
  const nodeActions: any[] = [];
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
    is_responsive: true,
    _zustand: {
      active_nodespace,
      on_node_action: (action: any) => {
        nodeActions.push(action);
      },
    },
    getSyncManager: () => ({ sync_active_nodespace: syncActiveNodeSpace }),
    send: vi.fn(),
  };
  return {
    manager: new WorkerCommunicationManager({ worker } as any),
    nodeActions,
    active_nodespace,
    syncActiveNodeSpace,
  };
};

describe("WorkerCommunicationManager path-aware IO value bytes", () => {
  it("applies IO value byte updates when the header path matches the active path", async () => {
    const { manager, nodeActions } = makeCommunicationManager(GROUP_PATH);

    await manager.receive_bytes(
      {
        type: "io_value",
        node: "inner-node",
        io: "out",
        preview: "1",
        mime: "application/octet-stream",
        path: JSON.stringify(GROUP_PATH),
      },
      new Uint8Array([1, 2, 3])
    );

    expect(nodeActions[0]).toMatchObject({
      type: "update",
      id: "inner-node",
      node: { id: "inner-node", io: { out: expect.any(Object) } },
    });
  });

  it("marks inactive IO value byte paths stale without mutating the active view", async () => {
    const { manager, nodeActions, active_nodespace } =
      makeCommunicationManager(GROUP_PATH);

    await manager.receive_bytes(
      {
        type: "io_value",
        node: "other-node",
        io: "out",
        preview: "1",
        mime: "application/octet-stream",
        path: JSON.stringify(OTHER_PATH),
      },
      new Uint8Array([4, 5, 6])
    );

    expect(nodeActions).toEqual([]);
    expect(active_nodespace.getState().stalePathKeys).toEqual({
      "other-group": true,
    });
  });

  it("resyncs conservatively for pathless IO bytes while editing a group", async () => {
    const { manager, nodeActions, syncActiveNodeSpace } =
      makeCommunicationManager(GROUP_PATH);

    await manager.receive_bytes(
      {
        type: "io_value",
        node: "root-node",
        io: "out",
        preview: "1",
        mime: "application/octet-stream",
      },
      new Uint8Array([7, 8, 9])
    );

    expect(nodeActions).toEqual([]);
    expect(syncActiveNodeSpace).toHaveBeenCalledWith(GROUP_PATH);
  });
});
