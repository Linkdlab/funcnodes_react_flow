import * as React from "react";
import { useEffect } from "react";
import { useKeyPress, useReactFlow } from "@xyflow/react";

import { useClipboardOperations } from "@/react-flow/hooks/useClipboardOperations";
import { shouldPreserveNativeCopy } from "@/react-flow/utils/copy-selection";
import { useGroupNodesAsNode, useUngroupNodes } from "@/groups";
import { useWorkerApi } from "@/workers";
import { isExecutableGroupNode, useNodeTools } from "@/nodes-core";
import { useFuncNodesContext } from "@/providers";

export const KeyHandler = () => {
  const delPressed = useKeyPress("Delete");
  const groupPressed = useKeyPress(["Control+g", "Meta+g"]);
  const ungroupPressed = useKeyPress(["Control+Alt+g", "Meta+Alt+g"]);
  const groupNodesAsNode = useGroupNodesAsNode();
  const ungroupNodes = useUngroupNodes();
  const { getEdges } = useReactFlow();
  const { getNodes, getSelectedNodes, getSplitNodes } = useNodeTools();
  const { copySelectedNodes } = useClipboardOperations();
  const { node: nodeApi, group: groupApi, edge: edgeApi } = useWorkerApi();
  const fnrf_zst = useFuncNodesContext();

  /** Show executable grouping feedback through the shared toast channel. */
  const showGroupingError = React.useCallback(
    (title: string, description: string) => {
      fnrf_zst.getStateManager().toaster?.error({ title, description });
    },
    [fnrf_zst]
  );

  // --- Deletion Logic ---
  useEffect(() => {
    if (delPressed) {
      const selectedEdges = getEdges().filter((e) => e.selected);
      for (const edge of selectedEdges) {
        if (
          !edge.source ||
          !edge.target ||
          !edge.sourceHandle ||
          !edge.targetHandle
        )
          continue;
        edgeApi?.remove_edge({
          src_nid: edge.source,
          src_ioid: edge.sourceHandle,
          trg_nid: edge.target,
          trg_ioid: edge.targetHandle,
        });
      }

      const selectedNodes = getSelectedNodes();
      const { group_nodes, default_nodes } = getSplitNodes(selectedNodes);
      for (const node of default_nodes) {
        nodeApi?.remove_node(node.id);
      }
      for (const node of group_nodes) {
        groupApi?.remove_group(node.id);
      }
    }
  }, [delPressed, getNodes, getEdges, nodeApi, groupApi, edgeApi]);

  useEffect(() => {
    const handleCopyKeyDown = (event: KeyboardEvent) => {
      const isCopyShortcut =
        (event.ctrlKey || event.metaKey) &&
        !event.altKey &&
        !event.shiftKey &&
        event.key.toLowerCase() === "c";

      if (!isCopyShortcut || event.repeat) {
        return;
      }

      if (shouldPreserveNativeCopy(event.target)) {
        return;
      }

      if (getSelectedNodes().length === 0) {
        return;
      }

      event.preventDefault();
      copySelectedNodes();
    };

    document.addEventListener("keydown", handleCopyKeyDown);

    return () => {
      document.removeEventListener("keydown", handleCopyKeyDown);
    };
  }, [copySelectedNodes, getSelectedNodes]);

  // --- Grouping Logic ---
  useEffect(() => {
    if (groupPressed) {
      const selectedNodes = getSelectedNodes();
      const { group_nodes, default_nodes } = getSplitNodes(selectedNodes);
      if (group_nodes.length > 0) {
        // Legacy UI groups are layout metadata. They need explicit
        // materialization before they can be part of executable grouping.
        showGroupingError(
          "Cannot create executable group",
          "Legacy visual groups must be materialized explicitly before grouping."
        );
        return;
      }
      if (default_nodes.length > 1) {
        groupNodesAsNode(default_nodes.map((n) => n.id)).catch((error) => {
          const description =
            error instanceof Error ? error.message : String(error);
          showGroupingError("Could not create executable group", description);
        });
      }
    }
  }, [
    groupPressed,
    getNodes,
    getSelectedNodes,
    getSplitNodes,
    groupNodesAsNode,
    showGroupingError,
  ]);

  useEffect(() => {
    if (ungroupPressed) {
      const selectedNodes = getSelectedNodes();
      const { default_nodes } = getSplitNodes(selectedNodes);
      const executableGroupNodeIds = default_nodes
        .filter((node) => {
          const serializedNode = (node.data as any)?.nodestore?.getState?.();
          return isExecutableGroupNode(serializedNode);
        })
        .map((node) => node.id);
      if (executableGroupNodeIds.length > 0) {
        ungroupNodes(executableGroupNodeIds).catch((error) => {
          const description =
            error instanceof Error ? error.message : String(error);
          showGroupingError("Could not ungroup executable group", description);
        });
      }
    }
  }, [
    ungroupPressed,
    getNodes,
    getSelectedNodes,
    getSplitNodes,
    ungroupNodes,
    showGroupingError,
  ]);

  return <></>;
};
