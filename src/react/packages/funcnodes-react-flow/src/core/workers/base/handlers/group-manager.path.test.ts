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

  it("adds a public group input at the active nodespace path", async () => {
    const { manager, sendCmd, syncActiveNodeSpace } = makeGroupManager();

    await manager.add_group_input("group-node", {
      id: "value",
      name: "Value",
      type: "int",
    });

    expect(sendCmd).toHaveBeenCalledWith({
      cmd: "add_group_input_at_path",
      kwargs: {
        path: GROUP_PATH,
        group_node_id: "group-node",
        options: { id: "value", name: "Value", type: "int" },
      },
      wait_for_response: true,
    });
    expect(syncActiveNodeSpace).toHaveBeenCalledTimes(1);
  });

  it("adds a public group input at an explicitly supplied parent path", async () => {
    const { manager, sendCmd, syncActiveNodeSpace } = makeGroupManager();

    await manager.add_group_input_at_path([], "group-node", {
      id: "value",
      name: "Value",
      type: "int",
    });

    expect(sendCmd).toHaveBeenCalledWith({
      cmd: "add_group_input_at_path",
      kwargs: {
        path: [],
        group_node_id: "group-node",
        options: { id: "value", name: "Value", type: "int" },
      },
      wait_for_response: true,
    });
    expect(syncActiveNodeSpace).toHaveBeenCalledTimes(1);
  });

  it("adds a public group output at the active nodespace path", async () => {
    const { manager, sendCmd, syncActiveNodeSpace } = makeGroupManager();

    await manager.add_group_output("group-node", {
      id: "result",
      name: "Result",
      type: "float",
    });

    expect(sendCmd).toHaveBeenCalledWith({
      cmd: "add_group_output_at_path",
      kwargs: {
        path: GROUP_PATH,
        group_node_id: "group-node",
        options: { id: "result", name: "Result", type: "float" },
      },
      wait_for_response: true,
    });
    expect(syncActiveNodeSpace).toHaveBeenCalledTimes(1);
  });

  it("adds a public group output at an explicitly supplied parent path", async () => {
    const { manager, sendCmd, syncActiveNodeSpace } = makeGroupManager(
      GROUP_PATH
    );

    await manager.add_group_output_at_path([], "group-node", {
      id: "result",
      name: "Result",
      type: "float",
    });

    expect(sendCmd).toHaveBeenCalledWith({
      cmd: "add_group_output_at_path",
      kwargs: {
        path: [],
        group_node_id: "group-node",
        options: { id: "result", name: "Result", type: "float" },
      },
      wait_for_response: true,
    });
    expect(syncActiveNodeSpace).toHaveBeenCalledTimes(1);
  });

  it("updates public group boundary metadata at the active nodespace path", async () => {
    const { manager, sendCmd, syncActiveNodeSpace } = makeGroupManager();

    await manager.update_group_io("group-node", "value", {
      name: "Renamed Value",
    });

    expect(sendCmd).toHaveBeenCalledWith({
      cmd: "update_group_io_at_path",
      kwargs: {
        path: GROUP_PATH,
        group_node_id: "group-node",
        boundary_id: "value",
        options: { name: "Renamed Value" },
      },
      wait_for_response: true,
    });
    expect(syncActiveNodeSpace).toHaveBeenCalledTimes(1);
  });

  it("updates public group boundary metadata at an explicit parent path", async () => {
    const { manager, sendCmd, syncActiveNodeSpace } = makeGroupManager();

    await manager.update_group_io_at_path([], "group-node", "value", {
      name: "Renamed Value",
    });

    expect(sendCmd).toHaveBeenCalledWith({
      cmd: "update_group_io_at_path",
      kwargs: {
        path: [],
        group_node_id: "group-node",
        boundary_id: "value",
        options: { name: "Renamed Value" },
      },
      wait_for_response: true,
    });
    expect(syncActiveNodeSpace).toHaveBeenCalledTimes(1);
  });

  it("removes public group boundary IO at the active nodespace path", async () => {
    const { manager, sendCmd, syncActiveNodeSpace } = makeGroupManager();

    await manager.remove_group_io("group-node", "value");

    expect(sendCmd).toHaveBeenCalledWith({
      cmd: "remove_group_io_at_path",
      kwargs: {
        path: GROUP_PATH,
        group_node_id: "group-node",
        boundary_id: "value",
      },
      wait_for_response: true,
    });
    expect(syncActiveNodeSpace).toHaveBeenCalledTimes(1);
  });

  it("removes public group boundary IO at an explicit parent path", async () => {
    const { manager, sendCmd, syncActiveNodeSpace } = makeGroupManager();

    await manager.remove_group_io_at_path([], "group-node", "value");

    expect(sendCmd).toHaveBeenCalledWith({
      cmd: "remove_group_io_at_path",
      kwargs: {
        path: [],
        group_node_id: "group-node",
        boundary_id: "value",
      },
      wait_for_response: true,
    });
    expect(syncActiveNodeSpace).toHaveBeenCalledTimes(1);
  });

  it("does not resync the active snapshot when boundary editing fails", async () => {
    const { manager, sendCmd, syncActiveNodeSpace } = makeGroupManager();
    sendCmd.mockRejectedValueOnce(new Error("Group input 'value' already exists"));

    await expect(
      manager.add_group_input("group-node", { id: "value" })
    ).rejects.toThrow("already exists");

    expect(syncActiveNodeSpace).not.toHaveBeenCalled();
  });
});
