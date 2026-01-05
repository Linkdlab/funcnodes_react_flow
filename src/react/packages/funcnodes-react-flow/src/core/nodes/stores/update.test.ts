import { describe, it, expect } from "vitest";
import { update_node, update_io } from "./update";
import { NodeStore, NodeType } from "../interfaces/node";
import { IOStore, IOType } from "../interfaces/io";

const createNodeStore = (state: NodeType, ioStoreUpdates: any[] = []) => {
  let currentState = { ...state };
  const setCalls: Array<Partial<NodeType>> = [];

  const ioStore: Pick<IOStore, "update"> = {
    update: (payload) => {
      ioStoreUpdates.push(payload);
    },
  } as IOStore;

  const store: NodeStore = {
    node_state: undefined as never,
    io_stores: new Map([["io-1", ioStore as IOStore]]),
    use: ((selector?: (state: NodeType) => unknown) =>
      selector ? selector(currentState) : currentState) as NodeStore["use"],
    useShallow: ((selector: (state: NodeType) => unknown) =>
      selector(currentState)) as NodeStore["useShallow"],
    getState: () => currentState,
    setState: (partial) => {
      setCalls.push(partial);
      currentState = { ...currentState, ...partial };
    },
    update: () => undefined,
    serialize: () => currentState as any,
  } as NodeStore;

  return { store, setCalls, ioStoreUpdates };
};

const createIOStore = (state: IOType) => {
  let currentState = { ...state };
  const setCalls: Array<Partial<IOType>> = [];
  const valueStore: { preview?: any; full?: any } = {};

  const store: IOStore = {
    io_state: undefined as never,
    use: ((selector?: (state: IOType) => unknown) =>
      selector ? selector(currentState) : currentState) as IOStore["use"],
    useShallow: ((selector: (state: IOType) => unknown) =>
      selector(currentState)) as IOStore["useShallow"],
    getState: () => currentState,
    setState: (partial) => {
      setCalls.push(partial);
      currentState = { ...currentState, ...partial };
    },
    update: () => undefined,
    valuestore: undefined as never,
    node: state.node,
    updateValueStore: (partial) => {
      Object.assign(valueStore, partial);
    },
    serialize: () => currentState as any,
  };

  return { store, setCalls, valueStore };
};

describe("update_node", () => {
  it("updates changed node fields and forwards io updates", () => {
    const initialState: NodeType = {
      id: "node-1",
      node_id: "node-1",
      node_name: "Node 1",
      name: "Node 1",
      in_trigger: false,
      inputs: [],
      outputs: [],
      io_order: ["io-1"],
      progress: {},
      properties: {
        "frontend:size": [200, 100],
        "frontend:pos": [0, 0],
        "frontend:collapsed": false,
      },
      reset_inputs_on_trigger: false,
    } as NodeType;

    const { store, setCalls, ioStoreUpdates } = createNodeStore(initialState);

    update_node(store, {
      name: "Node Updated",
      in_trigger: true,
      io_order: ["io-1", undefined],
      io: {
        "io-1": { name: "Input Updated" },
      },
      properties: {
        "frontend:pos": [10, 20],
      },
      render_options: {
        data: { preview_type: "text" },
      },
      reset_inputs_on_trigger: true,
    });

    expect(setCalls.length).toBe(1);
    expect(setCalls[0].name).toBe("Node Updated");
    expect(setCalls[0].in_trigger).toBe(true);
    expect(setCalls[0].io_order).toEqual(["io-1"]);
    expect(setCalls[0].properties?.["frontend:pos"]).toEqual([10, 20]);
    expect(setCalls[0].render_options).toEqual({ data: { preview_type: "text" } });
    expect(setCalls[0].reset_inputs_on_trigger).toBe(true);

    expect(ioStoreUpdates).toEqual([{ name: "Input Updated" }]);
  });

  it("does not update when no changes are detected", () => {
    const initialState: NodeType = {
      id: "node-1",
      node_id: "node-1",
      node_name: "Node 1",
      name: "Node 1",
      in_trigger: false,
      inputs: [],
      outputs: [],
      io_order: ["io-1"],
      progress: {},
      properties: {
        "frontend:size": [200, 100],
        "frontend:pos": [0, 0],
        "frontend:collapsed": false,
      },
      reset_inputs_on_trigger: false,
    } as NodeType;

    const { store, setCalls } = createNodeStore(initialState);

    update_node(store, {
      name: "Node 1",
      in_trigger: false,
      io_order: ["io-1"],
      properties: {
        "frontend:pos": [0, 0],
      },
    });

    expect(setCalls.length).toBe(0);
  });
});

describe("update_io", () => {
  it("updates mutable fields and value store", () => {
    const initialState: IOType = {
      id: "io-1",
      name: "Input",
      connected: false,
      does_trigger: false,
      full_id: "node-1:io-1",
      is_input: true,
      node: "node-1",
      type: "text",
      render_options: { set_default: false },
      hidden: false,
      emit_value_set: false,
      required: false,
    } as IOType;

    const { store, setCalls, valueStore } = createIOStore(initialState);

    update_io(store, {
      name: "Updated",
      connected: true,
      value: "preview",
      fullvalue: "full",
      render_options: { set_default: true },
      value_options: { min: 1, max: 3 },
    });

    expect(setCalls.length).toBe(1);
    expect(setCalls[0].name).toBe("Updated");
    expect(setCalls[0].connected).toBe(true);
    expect(setCalls[0].render_options).toEqual({ set_default: true });
    expect(setCalls[0].value_options).toEqual({ min: 1, max: 3 });
    expect(valueStore.preview).toBe("preview");
    expect(valueStore.full).toBe("full");
  });

  it("ignores read-only fields", () => {
    const initialState: IOType = {
      id: "io-1",
      name: "Input",
      connected: false,
      does_trigger: false,
      full_id: "node-1:io-1",
      is_input: true,
      node: "node-1",
      type: "text",
      render_options: { set_default: false },
      hidden: false,
      emit_value_set: false,
      required: false,
    } as IOType;

    const { store, setCalls } = createIOStore(initialState);

    update_io(store, {
      node: "node-2",
      type: "number",
      is_input: false,
    } as any);

    expect(setCalls.length).toBe(0);
  });
});
