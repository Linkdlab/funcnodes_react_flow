import { describe, expect, it, vi } from "vitest";

import { WorkerEdgeManager } from "./edge-manager";
import type { NodeSpacePath } from "@/funcnodes-context";

const GROUP_PATH: NodeSpacePath = [
  { groupNodeId: "group-1", label: "Group One" },
];

const makeEdgeManager = (path: NodeSpacePath = GROUP_PATH) => {
  const sendCmd = vi.fn().mockResolvedValue(true);
  const worker = {
    _zustand: {
      active_nodespace: {
        getState: () => ({ path }),
      },
    },
    getCommunicationManager: () => ({
      _send_cmd: sendCmd,
    }),
  };
  return {
    manager: new WorkerEdgeManager({ worker } as any),
    sendCmd,
  };
};

describe("WorkerEdgeManager path-aware commands", () => {
  it("connects nodes at the active nodespace path", async () => {
    const { manager, sendCmd } = makeEdgeManager();

    await manager.add_edge({
      src_nid: "source",
      src_ioid: "out",
      trg_nid: "target",
      trg_ioid: "a",
      replace: true,
    });

    expect(sendCmd).toHaveBeenCalledWith({
      cmd: "connect_at_path",
      kwargs: {
        path: GROUP_PATH,
        src_nid: "source",
        src_ioid: "out",
        trg_nid: "target",
        trg_ioid: "a",
        replace: true,
      },
    });
  });

  it("disconnects nodes at the active nodespace path", async () => {
    const { manager, sendCmd } = makeEdgeManager();

    await manager.remove_edge({
      src_nid: "source",
      src_ioid: "out",
      trg_nid: "target",
      trg_ioid: "a",
    });

    expect(sendCmd).toHaveBeenCalledWith({
      cmd: "disconnect_at_path",
      kwargs: {
        path: GROUP_PATH,
        src_nid: "source",
        src_ioid: "out",
        trg_nid: "target",
        trg_ioid: "a",
      },
    });
  });
});
