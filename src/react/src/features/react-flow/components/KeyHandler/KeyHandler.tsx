import * as React from "react";
import { useEffect } from "react";
import { useKeyPress, useReactFlow } from "@xyflow/react";
import { useFuncNodesContext } from "@/providers";
import { useNodeTools, groupNodes } from "@/barrel_imports";
import { useClipboardOperations } from "@/react-flow/hooks/useClipboardOperations";

export const KeyHandler = () => {
  const fnrf_zst = useFuncNodesContext();
  const delPressed = useKeyPress("Delete");
  const copyPressed = useKeyPress(["Meta+c", "Control+c", "Strg+c"]);
  const groupPressed = useKeyPress(["Control+g", "Meta+g"]);
  const ungroupPressed = useKeyPress(["Control+Alt+g", "Meta+Alt+g"]); // TODO: implement ungrouping

  const { getEdges } = useReactFlow();
  const { getNodes, getSelectedNodes, getSplitNodes } = useNodeTools();
  const { copySelectedNodes } = useClipboardOperations();

  // --- Deletion Logic ---
  useEffect(() => {
    if (delPressed) {
      if (!fnrf_zst.worker) return;

      const selectedEdges = getEdges().filter((e) => e.selected);
      for (const edge of selectedEdges) {
        if (
          !edge.source ||
          !edge.target ||
          !edge.sourceHandle ||
          !edge.targetHandle
        )
          continue;
        fnrf_zst.worker.remove_edge({
          src_nid: edge.source,
          src_ioid: edge.sourceHandle,
          trg_nid: edge.target,
          trg_ioid: edge.targetHandle,
        });
      }

      const selectedNodes = getSelectedNodes();
      const { group_nodes, default_nodes } = getSplitNodes(selectedNodes);
      for (const node of default_nodes) {
        fnrf_zst.worker.remove_node(node.id);
      }
      for (const node of group_nodes) {
        fnrf_zst.worker.remove_group(node.id);
      }
    }
  }, [delPressed, getNodes, getEdges, fnrf_zst]);

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
          group_nodes.map((n) => n.id),
          fnrf_zst
        );
      }
    }
  }, [groupPressed, getNodes, fnrf_zst]);

  useEffect(() => {
    if (ungroupPressed) {
      console.log("ungroupPressed");
      const selectedNodes = getSelectedNodes();
      const { group_nodes } = getSplitNodes(selectedNodes);
      if (group_nodes.length > 0) {
        throw new Error("remove groups not implemented");
        // removeGroups(
        //   group_nodes.map((n) => n.id),
        //   fnrf_zst
        // );
      }
    }
  }, [ungroupPressed, getNodes, fnrf_zst]);

  return <></>;
};
