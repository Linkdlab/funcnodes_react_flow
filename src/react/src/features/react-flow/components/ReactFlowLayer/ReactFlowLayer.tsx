import * as React from "react";
import { useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  Background,
  MiniMap,
  BackgroundVariant,
} from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";

import { useFuncNodesContext } from "@/providers";
import { ReactFlowLayerProps } from "@/app";
import { nodeTypes, edgeTypes, selector } from "@/react-flow/utils/node-types";
import { useReactFlowSelection } from "@/react-flow/hooks/useReactFlowSelection";
import { ReactFlowManager } from "../ReactFlowManager";
import { KeyHandler } from "../KeyHandler";
// import { ContextMenu, ContextMenuProps } from "../ContextMenu";
import "./ReactFlowLayer.scss";
import { usePasteClipboardData } from "@/react-flow/utils";
import { useTheme } from "@/providers";
import { useToast } from "@/shared-components";

const BackgroundVariantLookup: Record<string, BackgroundVariant> = {
  default: BackgroundVariant.Dots,
  metal: BackgroundVariant.Cross,
  light: BackgroundVariant.Dots,
  solarized: BackgroundVariant.Dots,
  midnight: BackgroundVariant.Dots,
  forest: BackgroundVariant.Dots,
  scientific: BackgroundVariant.Lines,
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

  return (
    <div className="reactflowlayer">
      <ReactFlow
        onPasteCapture={handlePasteCapture}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
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
