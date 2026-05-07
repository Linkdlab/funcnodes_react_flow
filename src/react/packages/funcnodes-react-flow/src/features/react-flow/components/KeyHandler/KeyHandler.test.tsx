import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, waitFor } from "@testing-library/react";

import { FuncNodesContext } from "../../../../app/providers/funcnodescontext";
import { KeyHandler } from "./KeyHandler";

const reactFlowState = vi.hoisted(() => ({
  nodes: [] as any[],
  edges: [] as any[],
  pressedKeys: new Set<string>(),
}));

vi.mock("@xyflow/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@xyflow/react")>();

  return {
    ...actual,
    useKeyPress: (keys: string | string[]) => {
      const keyList = Array.isArray(keys) ? keys : [keys];
      return keyList.some((key) => reactFlowState.pressedKeys.has(key));
    },
    useReactFlow: () => ({
      getNodes: () => reactFlowState.nodes,
      getEdges: () => reactFlowState.edges,
    }),
  };
});

/** Creates the minimal FuncNodes context surface used by KeyHandler tests. */
const createFnrfContext = (
  serializedNodes: Record<string, unknown>,
  overrides: Record<string, unknown> = {}
) => {
  const updateNodes = vi.fn((nodes: any[]) => {
    reactFlowState.nodes = nodes;
  });
  return {
    worker: undefined,
    useReactFlowStore: {
      getState: () => ({
        getNodes: () => reactFlowState.nodes,
        update_nodes: updateNodes,
      }),
    },
    getStateManager: () => ({
      toaster: {
        error: vi.fn(),
      },
    }),
    nodespace: {
      get_node: (id: string) => {
        const serializedNode = serializedNodes[id];
        if (!serializedNode) {
          return false;
        }

        return {
          serialize: () => serializedNode,
        };
      },
    },
    ...overrides,
    __test: {
      updateNodes,
      ...(overrides.__test as object | undefined),
    },
  } as any;
};

describe("KeyHandler copy behavior", () => {
  beforeEach(() => {
    reactFlowState.nodes = [];
    reactFlowState.edges = [];
    reactFlowState.pressedKeys = new Set();

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn(),
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
    window.getSelection()?.removeAllRanges();
  });

  it("copies selected node serialization when no native selection exists", () => {
    const serializedNode = {
      id: "serialized-node-1",
      node_id: "math.add",
      properties: {
        "frontend:pos": [0, 0],
      },
    };
    reactFlowState.nodes = [{ id: "node-1", selected: true }];

    render(
      <FuncNodesContext.Provider
        value={createFnrfContext({ "node-1": serializedNode })}
      >
        <KeyHandler />
      </FuncNodesContext.Provider>
    );

    const result = fireEvent.keyDown(document, {
      key: "c",
      ctrlKey: true,
    });

    expect(result).toBe(false);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      JSON.stringify({
        nodes: [serializedNode],
        edges: [],
      })
    );
  });

  it("keeps native copy behavior for rendered text selections", () => {
    const serializedNode = {
      id: "serialized-node-1",
      node_id: "math.add",
      properties: {
        "frontend:pos": [0, 0],
      },
    };
    reactFlowState.nodes = [{ id: "node-1", selected: true }];

    const { getByTestId } = render(
      <FuncNodesContext.Provider
        value={createFnrfContext({ "node-1": serializedNode })}
      >
        <KeyHandler />
        <div data-testid="copyable-text">copy this text</div>
      </FuncNodesContext.Provider>
    );

    const copyableText = getByTestId("copyable-text");
    const range = document.createRange();
    range.setStart(copyableText.firstChild as Text, 0);
    range.setEnd(copyableText.firstChild as Text, 4);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);

    const result = fireEvent.keyDown(copyableText, {
      key: "c",
      ctrlKey: true,
    });

    expect(result).toBe(true);
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
  });

  it("keeps native copy behavior for input text selections", () => {
    const serializedNode = {
      id: "serialized-node-1",
      node_id: "math.add",
      properties: {
        "frontend:pos": [0, 0],
      },
    };
    reactFlowState.nodes = [{ id: "node-1", selected: true }];

    const { getByRole } = render(
      <FuncNodesContext.Provider
        value={createFnrfContext({ "node-1": serializedNode })}
      >
        <KeyHandler />
        <input defaultValue="copy this text" />
      </FuncNodesContext.Provider>
    );

    const input = getByRole("textbox") as HTMLInputElement;
    input.focus();
    input.setSelectionRange(0, 4);

    const result = fireEvent.keyDown(input, {
      key: "c",
      ctrlKey: true,
    });

    expect(result).toBe(true);
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
  });

  it("does not copy node serialization from nokey regions", () => {
    const serializedNode = {
      id: "serialized-node-1",
      node_id: "math.add",
      properties: {
        "frontend:pos": [0, 0],
      },
    };
    reactFlowState.nodes = [{ id: "node-1", selected: true }];

    const { getByTestId } = render(
      <FuncNodesContext.Provider
        value={createFnrfContext({ "node-1": serializedNode })}
      >
        <KeyHandler />
        <div className="nokey" data-testid="tooltip-content" tabIndex={0}>
          tooltip copy area
        </div>
      </FuncNodesContext.Provider>
    );

    const tooltipContent = getByTestId("tooltip-content");
    tooltipContent.focus();

    const result = fireEvent.keyDown(tooltipContent, {
      key: "c",
      ctrlKey: true,
    });

    expect(result).toBe(true);
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
  });

  it("does not interfere when no node is selected", () => {
    render(
      <FuncNodesContext.Provider value={createFnrfContext({})}>
        <KeyHandler />
      </FuncNodesContext.Provider>
    );

    const result = fireEvent.keyDown(document, {
      key: "c",
      ctrlKey: true,
    });

    expect(result).toBe(true);
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
  });
});

describe("KeyHandler executable grouping behavior", () => {
  beforeEach(() => {
    reactFlowState.nodes = [];
    reactFlowState.edges = [];
    reactFlowState.pressedKeys = new Set();
  });

  afterEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
  });

  it("groups selected backend nodes as an executable group and selects the result", async () => {
    const groupNodesAsNode = vi.fn().mockResolvedValue("new-group");
    reactFlowState.nodes = [
      { id: "node-a", type: "default", selected: true },
      { id: "node-b", type: "default", selected: true },
      { id: "new-group", type: "default", selected: false },
    ];
    reactFlowState.pressedKeys = new Set(["Control+g"]);
    const context = createFnrfContext(
      {},
      {
        worker: {
          api: {
            group: {
              group_nodes_as_node: groupNodesAsNode,
            },
          },
        },
      }
    );

    render(
      <FuncNodesContext.Provider value={context}>
        <KeyHandler />
      </FuncNodesContext.Provider>
    );

    await waitFor(() => {
      expect(groupNodesAsNode).toHaveBeenCalledWith(["node-a", "node-b"]);
    });
    await waitFor(() => {
      expect(reactFlowState.nodes).toEqual([
        { id: "node-a", type: "default", selected: false },
        { id: "node-b", type: "default", selected: false },
        { id: "new-group", type: "default", selected: true },
      ]);
    });
  });

  it("rejects selected legacy visual groups instead of mixing them into executable grouping", async () => {
    const toastError = vi.fn();
    const groupNodesAsNode = vi.fn().mockResolvedValue("new-group");
    reactFlowState.nodes = [
      { id: "node-a", type: "default", selected: true },
      { id: "legacy-group", type: "group", selected: true },
    ];
    reactFlowState.pressedKeys = new Set(["Control+g"]);

    render(
      <FuncNodesContext.Provider
        value={createFnrfContext(
          {},
          {
            worker: {
              api: {
                group: {
                  group_nodes_as_node: groupNodesAsNode,
                },
              },
            },
            getStateManager: () => ({
              toaster: {
                error: toastError,
              },
            }),
          }
        )}
      >
        <KeyHandler />
      </FuncNodesContext.Provider>
    );

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith({
        title: "Cannot create executable group",
        description:
          "Legacy visual groups must be materialized explicitly before grouping.",
      });
    });
    expect(groupNodesAsNode).not.toHaveBeenCalled();
  });

  it("leaves the current canvas unchanged when executable grouping fails", async () => {
    const groupNodesAsNode = vi
      .fn()
      .mockRejectedValue(new Error("grouping failed"));
    const toastError = vi.fn();
    const initialNodes = [
      { id: "node-a", type: "default", selected: true },
      { id: "node-b", type: "default", selected: true },
    ];
    reactFlowState.nodes = initialNodes;
    reactFlowState.pressedKeys = new Set(["Control+g"]);

    render(
      <FuncNodesContext.Provider
        value={createFnrfContext(
          {},
          {
            worker: {
              api: {
                group: {
                  group_nodes_as_node: groupNodesAsNode,
                },
              },
            },
            getStateManager: () => ({
              toaster: {
                error: toastError,
              },
            }),
          }
        )}
      >
        <KeyHandler />
      </FuncNodesContext.Provider>
    );

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith({
        title: "Could not create executable group",
        description: "grouping failed",
      });
    });
    expect(reactFlowState.nodes).toBe(initialNodes);
  });

  it("ungroups selected executable group nodes", async () => {
    const ungroupNode = vi.fn().mockResolvedValue(undefined);
    reactFlowState.nodes = [
      {
        id: "group-node",
        type: "default",
        selected: true,
        data: {
          nodestore: {
            getState: () => ({
              id: "group-node",
              node_id: "funcnodes_core.group",
            }),
          },
        },
      },
      {
        id: "normal-node",
        type: "default",
        selected: true,
        data: {
          nodestore: {
            getState: () => ({
              id: "normal-node",
              node_id: "math.add",
            }),
          },
        },
      },
    ];
    reactFlowState.pressedKeys = new Set(["Control+Alt+g"]);

    render(
      <FuncNodesContext.Provider
        value={createFnrfContext(
          {},
          {
            worker: {
              api: {
                group: {
                  ungroup_node: ungroupNode,
                },
              },
            },
          }
        )}
      >
        <KeyHandler />
      </FuncNodesContext.Provider>
    );

    await waitFor(() => {
      expect(ungroupNode).toHaveBeenCalledWith("group-node");
    });
    expect(ungroupNode).toHaveBeenCalledTimes(1);
  });
});
