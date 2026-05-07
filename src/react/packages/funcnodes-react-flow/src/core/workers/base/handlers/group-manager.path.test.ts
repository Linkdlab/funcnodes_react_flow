import { describe, expect, it, vi } from "vitest";

import { WorkerGroupManager } from "./group-manager";
import type { NodeSpacePath } from "@/funcnodes-context";

const GROUP_PATH: NodeSpacePath = [
  { groupNodeId: "outer-group", label: "Outer Group" },
];

/** Creates a group manager with mocked worker dependencies for command tests. */
const makeGroupManager = (path: NodeSpacePath = GROUP_PATH) => {
  const sendCmd = vi.fn().mockResolvedValue({ id: "new-group" });
  const syncActiveNodeSpace = vi.fn().mockResolvedValue(undefined);
  const worker = {
    _zustand: {
      active_nodespace: {
        getState: () => ({ path }),
      },
    },
    getCommunicationManager: () => ({
      _send_cmd: sendCmd,
    }),
    getEventManager: () => ({
      _receive_groups: vi.fn(),
    }),
    getSyncManager: () => ({
      sync_active_nodespace: syncActiveNodeSpace,
      locally_update_group: vi.fn(),
    }),
  };
  return {
    manager: new WorkerGroupManager({ worker } as any),
    sendCmd,
    syncActiveNodeSpace,
  };
};

describe("WorkerGroupManager executable group commands", () => {
  it("groups selected nodes as an executable group at the active nodespace path", async () => {
    const { manager, sendCmd, syncActiveNodeSpace } = makeGroupManager();

    const newGroupId = await manager.group_nodes_as_node(
      ["node-a", "node-b"],
      { name: "Selected Nodes" }
    );

    expect(sendCmd).toHaveBeenCalledWith({
      cmd: "group_nodes_as_node_at_path",
      kwargs: {
        path: GROUP_PATH,
        node_ids: ["node-a", "node-b"],
        name: "Selected Nodes",
      },
      wait_for_response: true,
    });
    expect(syncActiveNodeSpace).toHaveBeenCalledTimes(1);
    expect(newGroupId).toBe("new-group");
  });

  it("ungroups an executable group node at the active nodespace path", async () => {
    const { manager, sendCmd, syncActiveNodeSpace } = makeGroupManager();

    await manager.ungroup_node("group-node");

    expect(sendCmd).toHaveBeenCalledWith({
      cmd: "ungroup_node_at_path",
      kwargs: { path: GROUP_PATH, group_node_id: "group-node" },
      wait_for_response: true,
    });
    expect(syncActiveNodeSpace).toHaveBeenCalledTimes(1);
  });

  it("materializes a selected legacy group explicitly at the active nodespace path", async () => {
    const { manager, sendCmd, syncActiveNodeSpace } = makeGroupManager([]);

    const newGroupId = await manager.materialize_group("legacy-group");

    expect(sendCmd).toHaveBeenCalledWith({
      cmd: "materialize_group_at_path",
      kwargs: { path: [], legacy_group_id: "legacy-group" },
      wait_for_response: true,
    });
    expect(syncActiveNodeSpace).toHaveBeenCalledTimes(1);
    expect(newGroupId).toBe("new-group");
  });
});
