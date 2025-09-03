import * as React from "react";
import { useEffect } from "react";
import { useKeyPress, useReactFlow } from "@xyflow/react";

import { useClipboardOperations } from "@/react-flow/hooks/useClipboardOperations";
import { useGroupNodes } from "@/groups";
import { useWorkerApi } from "@/workers";
import { useNodeTools } from "@/nodes-core";

export const KeyHandler = () => {
  const delPressed = useKeyPress("Delete");
  const copyPressed = useKeyPress(["Meta+c", "Control+c", "Strg+c"]);
  const groupPressed = useKeyPress(["Control+g", "Meta+g"]);
  const ungroupPressed = useKeyPress(["Control+Alt+g", "Meta+Alt+g"]); // TODO: implement ungrouping
  const groupNodes = useGroupNodes();
  const { getEdges } = useReactFlow();
  const { getNodes, getSelectedNodes, getSplitNodes } = useNodeTools();
  const { copySelectedNodes } = useClipboardOperations();
  const { node: nodeApi, group: groupApi, edge: edgeApi } = useWorkerApi();

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

  // --- Copy Logic ---
  useEffect(() => {
    if (copyPressed) {
      copySelectedNodes();
    }
  }, [copyPressed, copySelectedNodes]);

  // --- Grouping Logic ---
  useEffect(() => {
    if (groupPressed) {
      const selectedNodes = getSelectedNodes();
      const { group_nodes, default_nodes } = getSplitNodes(selectedNodes);
      if (selectedNodes.length > 0) {
        groupNodes(
          default_nodes.map((n) => n.id),
          group_nodes.map((n) => n.id)
        );
      }
    }
  }, [groupPressed, getNodes]);

  useEffect(() => {
    if (ungroupPressed) {
      const selectedNodes = getSelectedNodes();
      const { group_nodes } = getSplitNodes(selectedNodes);
      group_nodes.forEach((n) => {
        groupApi?.remove_group(n.id);
      });
    }
  }, [ungroupPressed, getNodes]);

  return <></>;
};
