import { describe, expect, it, vi } from "vitest";

import { DEFAULT_FN_PROPS } from "@/app";
import { FuncNodesReactFlow } from "@/funcnodes-context";
import { WorkerSyncManager } from "./sync-manager";
import type { EditableNodeSpaceSnapshot } from "@/funcnodes-context";
import type { SerializedNodeType } from "@/nodes-core";

const makeSerializedNode = (
  id: string,
  name: string = id
): SerializedNodeType =>
  ({
    id,
    node_id: "example.node",
    node_name: "Example",
    name,
    properties: {
      "frontend:collapsed": false,
      "frontend:pos": [0, 0],
      "frontend:size": [200, 100],
    },
    reset_inputs_on_trigger: false,
    in_trigger: false,
    inputs: [],
    outputs: [],
    io_order: [],
    io: {},
    progress: {},
  } as SerializedNodeType);

/** Creates a serialized node with one input and one output for value sync tests. */
const makeSerializedValueNode = (
  id: string,
  name: string = id
): SerializedNodeType =>
  ({
    ...makeSerializedNode(id, name),
    io_order: ["in", "out"],
    io: {
      in: {
        id: "in",
        name: "In",
        node: id,
        full_id: `${id}.in`,
        type: "int",
        value: undefined,
        fullvalue: undefined,
        is_input: true,
        connected: false,
        does_trigger: false,
        render_options: { set_default: true, type: "int" },
        hidden: false,
        emit_value_set: true,
        required: false,
      },
      out: {
        id: "out",
        name: "Out",
        node: id,
        full_id: `${id}.out`,
        type: "int",
        value: undefined,
        fullvalue: undefined,
        is_input: false,
        connected: false,
        does_trigger: false,
        render_options: { set_default: true, type: "int" },
        hidden: false,
        emit_value_set: true,
        required: false,
      },
    },
  } as SerializedNodeType);

const makeFlow = () =>
  new FuncNodesReactFlow({
    ...DEFAULT_FN_PROPS,
    id: "active-nodespace-sync-test",
    useWorkerManager: false,
  });

const getRFState = (flow: FuncNodesReactFlow) =>
  flow.getReactFlowManager().useReactFlowStore.getState();

const makeSyncManager = (
  snapshot: EditableNodeSpaceSnapshot,
  flow: FuncNodesReactFlow
) => {
  const sendCmd = vi.fn().mockResolvedValue(snapshot);
  const worker = {
    is_open: true,
    _zustand: flow,
    getCommunicationManager: () => ({
      _send_cmd: sendCmd,
    }),
  };
  const manager = new WorkerSyncManager({
    worker,
    on_sync_complete: undefined,
  } as any);
  return { manager, sendCmd };
};

describe("WorkerSyncManager active nodespace sync", () => {
  it("requests and renders the root active nodespace snapshot", async () => {
    const flow = makeFlow();
    const snapshot: EditableNodeSpaceSnapshot = {
      path: [],
      nodes: [makeSerializedNode("root-node")],
      edges: [],
      groups: {},
    };
    const { manager, sendCmd } = makeSyncManager(snapshot, flow);

    await manager.sync_active_nodespace([]);

    expect(sendCmd).toHaveBeenCalledWith({
      cmd: "get_nodespace_at_path",
      kwargs: { path: [] },
      wait_for_response: true,
      unique: true,
    });
    expect(getRFState(flow).getNodes().map((n) => n.id)).toEqual(["root-node"]);
    expect(Array.from(flow.nodespace.nodesstates.keys())).toEqual([
      "root-node",
    ]);
  });

  it("replaces root nodes with the returned nested group snapshot", async () => {
    const flow = makeFlow();
    flow.getNodespaceManager().apply_nodespace_snapshot({
      path: [],
      nodes: [makeSerializedNode("root-node")],
      edges: [],
      groups: {},
    });
    const snapshot: EditableNodeSpaceSnapshot = {
      path: [{ groupNodeId: "group-1", label: "Group One" }],
      nodes: [makeSerializedNode("inner-node")],
      edges: [],
      groups: {},
    };
    const { manager } = makeSyncManager(snapshot, flow);

    await manager.sync_active_nodespace([
      { groupNodeId: "group-1", label: "Group One" },
    ]);

    expect(getRFState(flow).getNodes().map((n) => n.id)).toEqual([
      "inner-node",
    ]);
    expect(Array.from(flow.nodespace.nodesstates.keys())).toEqual([
      "inner-node",
    ]);
  });

  it("hydrates IO preview values after switching active nodespaces", async () => {
    const flow = makeFlow();
    const path = [{ groupNodeId: "group-1", label: "Group One" }];
    const snapshot: EditableNodeSpaceSnapshot = {
      path,
      nodes: [makeSerializedValueNode("inner-node")],
      edges: [],
      groups: {},
    };
    const { manager, sendCmd } = makeSyncManager(snapshot, flow);
    sendCmd.mockResolvedValueOnce(snapshot).mockResolvedValueOnce({
      in: 12,
      out: 34,
    });

    await manager.sync_active_nodespace(path);

    expect(sendCmd).toHaveBeenCalledWith({
      cmd: "get_ios_values_at_path",
      kwargs: { path, nid: "inner-node" },
      wait_for_response: true,
    });
    expect(
      flow.nodespace
        .get_node("inner-node")!
        .io_stores.get("in")!
        .valuestore.getState().preview?.value
    ).toBe(12);
    expect(
      flow.nodespace
        .get_node("inner-node")!
        .io_stores.get("out")!
        .valuestore.getState().preview?.value
    ).toBe(34);
  });

  it("renders snapshot edges and legacy groups scoped to the active path", async () => {
    const flow = makeFlow();
    const snapshot: EditableNodeSpaceSnapshot = {
      path: [],
      nodes: [makeSerializedNode("source"), makeSerializedNode("target")],
      edges: [["source", "out", "target", "in"]],
      groups: {
        "legacy-group": {
          node_ids: ["source", "target"],
          child_groups: [],
          parent_group: null,
          meta: {},
          position: [4, 8],
        },
      },
    };
    const { manager } = makeSyncManager(snapshot, flow);

    await manager.sync_active_nodespace([]);

    expect(getRFState(flow).getEdges()).toMatchObject([
      {
        source: "source",
        sourceHandle: "out",
        target: "target",
        targetHandle: "in",
      },
    ]);
    expect(getRFState(flow).getNode("legacy-group")).toMatchObject({
      id: "legacy-group",
      type: "group",
    });
  });

  it("clears the stale marker for a path after it is resynced", async () => {
    const flow = makeFlow();
    const path = [{ groupNodeId: "group-1", label: "Group One" }];
    flow.active_nodespace.setState({
      path,
      stalePathKeys: { "group-1": true, "other-group": true },
    });
    const { manager } = makeSyncManager(
      { path, nodes: [makeSerializedNode("inner-node")], edges: [], groups: {} },
      flow
    );

    await manager.sync_active_nodespace(path);

    expect(flow.active_nodespace.getState().stalePathKeys).toEqual({
      "other-group": true,
    });
  });

  it("sends local node updates to the active nodespace path", async () => {
    const flow = makeFlow();
    const path = [{ groupNodeId: "group-1", label: "Group One" }];
    flow.active_nodespace.setState({ path });
    const { manager, sendCmd } = makeSyncManager(
      { path, nodes: [], edges: [], groups: {} },
      flow
    );
    sendCmd.mockResolvedValueOnce({});

    manager.locally_update_node({
      type: "update",
      id: "inner-node",
      node: { name: "Renamed Inner" },
      from_remote: false,
      immediate: true,
    });
    await vi.waitFor(() => expect(sendCmd).toHaveBeenCalled());

    expect(sendCmd).toHaveBeenCalledWith({
      cmd: "update_node_at_path",
      kwargs: {
        path,
        nid: "inner-node",
        data: { name: "Renamed Inner" },
      },
      wait_for_response: true,
    });
    manager.stop();
  });
});
