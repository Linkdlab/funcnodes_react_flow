import { describe, expect, it, vi } from "vitest";

import { WorkerNodeManager } from "./node-manager";
import type { NodeSpacePath } from "@/funcnodes-context";

const GROUP_PATH: NodeSpacePath = [
  { groupNodeId: "group-1", label: "Group One" },
];

const makeNodeManager = (path: NodeSpacePath = GROUP_PATH) => {
  const sendCmd = vi.fn().mockResolvedValue("value");
  const onNodeAction = vi.fn();
  const worker = {
    _zustand: {
      active_nodespace: {
        getState: () => ({ path }),
      },
      on_node_action: onNodeAction,
    },
    getCommunicationManager: () => ({
      _send_cmd: sendCmd,
    }),
    getEventManager: () => ({
      _receive_node_added: vi.fn(),
    }),
    getSyncManager: () => ({
      locally_update_node: vi.fn(),
    }),
  };
  return {
    manager: new WorkerNodeManager({ worker } as any),
    sendCmd,
    onNodeAction,
  };
};

describe("WorkerNodeManager path-aware commands", () => {
  it("triggers nodes at the active nodespace path", async () => {
    const { manager, sendCmd } = makeNodeManager();

    await manager.trigger_node("inner-node");

    expect(sendCmd).toHaveBeenCalledWith({
      cmd: "trigger_node_at_path",
      kwargs: { path: GROUP_PATH, nid: "inner-node" },
      wait_for_response: false,
    });
  });

  it("removes nodes at the active nodespace path", async () => {
    const { manager, sendCmd } = makeNodeManager();

    await manager.remove_node("inner-node");

    expect(sendCmd).toHaveBeenCalledWith({
      cmd: "remove_node_at_path",
      kwargs: { path: GROUP_PATH, id: "inner-node" },
    });
  });

  it("fetches IO values through the active nodespace path", async () => {
    const { manager, sendCmd } = makeNodeManager();

    await manager.get_io_value({ nid: "inner-node", ioid: "out" });

    expect(sendCmd).toHaveBeenCalledWith({
      cmd: "get_io_value_at_path",
      kwargs: { path: GROUP_PATH, nid: "inner-node", ioid: "out" },
      wait_for_response: true,
    });
  });

  it("sets IO values through the active nodespace path", async () => {
    const { manager, sendCmd } = makeNodeManager();

    await manager.set_io_value({
      nid: "inner-node",
      ioid: "a",
      value: 4,
      set_default: true,
    });

    expect(sendCmd).toHaveBeenCalledWith({
      cmd: "set_io_value_at_path",
      kwargs: {
        path: GROUP_PATH,
        nid: "inner-node",
        ioid: "a",
        value: 4,
        set_default: true,
      },
      wait_for_response: true,
    });
  });

  it("updates IO options through the active nodespace path", async () => {
    const { manager, sendCmd } = makeNodeManager();

    await manager.update_io_options({
      nid: "inner-node",
      ioid: "a",
      options: { name: "Input A" },
    });

    expect(sendCmd).toHaveBeenCalledWith({
      cmd: "update_io_options_at_path",
      kwargs: {
        path: GROUP_PATH,
        nid: "inner-node",
        ioid: "a",
        name: "Input A",
      },
      wait_for_response: true,
    });
  });

  it("uses an explicit empty root path for root commands", async () => {
    const { manager, sendCmd } = makeNodeManager([]);

    await manager.trigger_node("root-node");

    expect(sendCmd).toHaveBeenCalledWith({
      cmd: "trigger_node_at_path",
      kwargs: { path: [], nid: "root-node" },
      wait_for_response: false,
    });
  });
});
