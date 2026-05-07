import * as React from "react";
import { useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  Background,
  MiniMap,
  BackgroundVariant,
} from "@xyflow/react";
import type { Node as RFNode } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";

import { useFuncNodesContext } from "@/providers";
import type { ReactFlowLayerProps } from "@/app";
import type { FuncNodesReactFlow } from "@/funcnodes-context";
import { nodeTypes, edgeTypes, selector } from "@/react-flow/utils/node-types";
import { useReactFlowSelection } from "@/react-flow/hooks/useReactFlowSelection";
import { ReactFlowManager } from "../ReactFlowManager";
import { KeyHandler } from "../KeyHandler";
// import { ContextMenu, ContextMenuProps } from "../ContextMenu";
import "./ReactFlowLayer.scss";
import { usePasteClipboardData } from "@/react-flow/utils";
import { useTheme } from "@/providers";
import { useToast } from "@/shared-components";
import { isExecutableGroupNode } from "@/nodes-core";

const BackgroundVariantLookup: Record<string, BackgroundVariant> = {
  default: BackgroundVariant.Dots,
  metal: BackgroundVariant.Cross,
  light: BackgroundVariant.Dots,
  solarized: BackgroundVariant.Dots,
  midnight: BackgroundVariant.Dots,
  forest: BackgroundVariant.Dots,
  scientific: BackgroundVariant.Lines,
};

const NODE_DOUBLE_CLICK_INTERACTIVE_SELECTOR = [
  "button",
  "input",
  "textarea",
  "select",
  "a",
  "[role='button']",
  "[data-no-group-enter]",
  ".nodrag",
  ".react-flow__handle",
].join(",");

/**
 * Returns whether a double-click target belongs to an inner control that should
 * keep its own interaction instead of entering an executable group.
 */
const isInteractiveDoubleClickTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest(NODE_DOUBLE_CLICK_INTERACTIVE_SELECTOR));
};

/**
 * Enter an executable group when a React Flow node double-click targets the node
 * body rather than an inner control.
 */
export const enterExecutableGroupFromNodeDoubleClick = async (
  fnrf_zst: FuncNodesReactFlow,
  node: RFNode,
  event?: React.MouseEvent
): Promise<boolean> => {
  if (fnrf_zst.active_nodespace.getState().loading) return false;
  if (isInteractiveDoubleClickTarget(event?.target ?? null)) return false;
  if (node.type === "group") return false;

  const nodestore = (node.data as any)?.nodestore;
  const serializedNode = nodestore?.getState?.();
  if (!serializedNode || !isExecutableGroupNode(serializedNode)) return false;

  const groupNodeId = serializedNode.id ?? node.id;
  if (!groupNodeId) return false;
  const label =
    serializedNode.name || serializedNode.node_name || serializedNode.id || node.id;

  try {
    fnrf_zst.enter_group_nodespace(groupNodeId, label);
    await fnrf_zst.sync_active_nodespace();
    return true;
  } catch (error) {
    const description = error instanceof Error ? error.message : String(error);
    fnrf_zst.getStateManager().toaster?.error({
      title: "Could not enter group",
      description,
    });
    return false;
  }
};

export const ReactFlowLayer = (props: ReactFlowLayerProps) => {
  const fnrf_zst = useFuncNodesContext();
  const reactflowRef = useRef<HTMLDivElement>(null);
  const { colorTheme } = useTheme();
  // const [menu, setMenu] = useState<ContextMenuProps | null>(null);

  const { onSelectionChange } = useReactFlowSelection();
  const toast = useToast();

  // useForceGraph();
  React.useEffect(() => {
    fnrf_zst.getStateManager().toaster = toast;
  }, []);
  useEffect(() => {
    fnrf_zst.reactflowRef = reactflowRef.current;
  }, [reactflowRef]);

  // const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    fnrf_zst.useReactFlowStore(useShallow(selector));

  const pasteClipboardData = usePasteClipboardData();

  const handlePasteCapture = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      const reftarget = reactflowRef.current;
      if (!reftarget) return;
      let current_target = e.target;
      let steps = 0;
      while (current_target && (current_target as any).parentElement) {
        if (current_target === reftarget) {
          break;
        }
        steps++;
        current_target = (current_target as any).parentElement;
      }
      fnrf_zst.logger.debug(`onPasteCapture: ${steps} steps to reactflow`);
      if (steps <= 2) {
        pasteClipboardData(
          e.clipboardData.getData("text/plain"),
          onNodesChange
        );
      }
    },
    [pasteClipboardData, onNodesChange, fnrf_zst.logger]
  );

  /**
   * Route node double-clicks to executable group navigation when applicable.
   */
  const onNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: RFNode) => {
      void enterExecutableGroupFromNodeDoubleClick(fnrf_zst, node, event);
    },
    [fnrf_zst]
  );

  return (
    <div className="reactflowlayer">
      <ReactFlow
        onPasteCapture={handlePasteCapture}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        minZoom={props.minZoom}
        maxZoom={props.maxZoom}
        fitView
        onSelectionChange={onSelectionChange}
        ref={reactflowRef}
        // onPaneClick={onPaneClick}
        panOnDrag={!props.static}
      >
        <ReactFlowManager />
        <KeyHandler />
        <Background
          color="#888"
          gap={24}
          size={2}
          variant={
            BackgroundVariantLookup[colorTheme] ||
            BackgroundVariantLookup.default
          }
          patternClassName="fn-background-pattern"
        />
        {props.minimap && (
          <MiniMap
            nodeStrokeWidth={3}
            pannable={!props.static}
            zoomable={!props.static}
            zoomStep={3}
          />
        )}
        {/* {menu && <ContextMenu onClick={onPaneClick} {...menu} />} */}
      </ReactFlow>
    </div>
  );
};
