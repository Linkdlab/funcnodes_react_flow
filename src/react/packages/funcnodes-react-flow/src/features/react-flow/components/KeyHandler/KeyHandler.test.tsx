import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";

import { FuncNodesContext } from "../../../../app/providers/funcnodescontext";
import { KeyHandler } from "./KeyHandler";

const reactFlowState = vi.hoisted(() => ({
  nodes: [] as any[],
  edges: [] as any[],
}));

vi.mock("@xyflow/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@xyflow/react")>();

  return {
    ...actual,
    useKeyPress: () => false,
    useReactFlow: () => ({
      getNodes: () => reactFlowState.nodes,
      getEdges: () => reactFlowState.edges,
    }),
  };
});

const createFnrfContext = (serializedNodes: Record<string, unknown>) =>
  ({
    worker: undefined,
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
  }) as any;

describe("KeyHandler copy behavior", () => {
  beforeEach(() => {
    reactFlowState.nodes = [];
    reactFlowState.edges = [];

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
