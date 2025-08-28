import { useCallback } from "react";
import { Node, Edge } from "@xyflow/react";
import { useFuncNodesContext } from "@/providers";
import { split_rf_nodes } from "@/nodes-core";

export const useReactFlowSelection = () => {
  const fnrf_zst = useFuncNodesContext();

  const onSelectionChange = useCallback(
    ({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) => {
      const { group_nodes, default_nodes } = split_rf_nodes(nodes);

      const cs = fnrf_zst.local_state.getState();
      fnrf_zst.local_state.setState({
        ...cs,
        selected_nodes: default_nodes.map((node) => node.id),
        selected_edges: edges.map((edge) => edge.id),
        selected_groups: group_nodes.map((node) => node.id),
      });
    },
    [fnrf_zst]
  );

  return {
    onSelectionChange,
  };
};
