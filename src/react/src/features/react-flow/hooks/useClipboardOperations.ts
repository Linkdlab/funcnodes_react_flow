import { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import { useFuncNodesContext } from "@/providers";
import { SerializedNodeType, useNodeTools } from "@/nodes-core";
import { SerializedEdge } from "@/edges-core";

export const useClipboardOperations = () => {
  const fnrf_zst = useFuncNodesContext();
  const { getEdges } = useReactFlow();
  const { getSelectedNodes } = useNodeTools();

  const copySelectedNodes = useCallback(() => {
    const edges = getEdges();
    const selectedNodes = getSelectedNodes();

    if (selectedNodes.length === 0) return;

    const copydata: {
      nodes: SerializedNodeType[];
      edges: SerializedEdge[];
    } = { nodes: [], edges: [] };

    for (const node of selectedNodes) {
      const fnnode = fnrf_zst.nodespace.get_node(node.id, false);
      if (fnnode) {
        copydata.nodes.push(fnnode.serialize());
      }
    }

    const selectedNodeIds = new Set(selectedNodes.map((n) => n.id));
    const internalEdges = edges.filter(
      (edge) =>
        selectedNodeIds.has(edge.source) && selectedNodeIds.has(edge.target)
    );

    for (const edge of internalEdges) {
      if (!edge.sourceHandle || !edge.targetHandle) continue;
      copydata.edges.push({
        src_nid: edge.source,
        src_ioid: edge.sourceHandle,
        trg_nid: edge.target,
        trg_ioid: edge.targetHandle,
      });
    }

    navigator.clipboard.writeText(JSON.stringify(copydata));
  }, [getSelectedNodes, getEdges, fnrf_zst]);

  return {
    copySelectedNodes,
  };
};
