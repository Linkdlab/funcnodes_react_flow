import { OnNodesChange } from "@xyflow/react";
import { useWorkerApi } from "@/workers";
import * as React from "react";
import { useFuncNodesContext } from "@/providers";
import { SerializedNodeType } from "@/nodes-core";
import { SerializedEdge } from "@/edges-core";

export const usePasteClipboardData = () => {
  const { node: nodeApi, edge: edgeApi } = useWorkerApi();
  const fnrf_zst = useFuncNodesContext();

  const func = React.useCallback(
    async (data: string, onNodesChange: OnNodesChange) => {
      try {
        if (!data) return;
        if (!nodeApi) return;
        if (!edgeApi) return;
        const copydata: {
          nodes: SerializedNodeType[];
          edges: SerializedEdge[];
        } = JSON.parse(data);
        if (!copydata) return;
        if (!fnrf_zst.worker) return;
        if (!copydata.nodes) return;

        const mean_position = [0, 0];
        for (const node of copydata.nodes) {
          mean_position[0] += node.properties["frontend:pos"][0];
          mean_position[1] += node.properties["frontend:pos"][1];
        }
        mean_position[0] /= copydata.nodes.length;
        mean_position[1] /= copydata.nodes.length;

        const rel_node_infos: {
          id: string;
          src_id: string;
          position: [number, number];
          new_id?: string;
        }[] = [];
        for (const node of copydata.nodes) {
          const rel_node_info: {
            id: string;
            src_id: string;
            position: [number, number];
          } = {
            id: node.node_id,
            src_id: node.id,
            position: [
              node.properties["frontend:pos"][0] - mean_position[0],
              node.properties["frontend:pos"][1] - mean_position[1],
            ],
          };
          rel_node_infos.push(rel_node_info);
        }

        for (const node of rel_node_infos) {
          const new_node = await nodeApi.add_node(node.id);
          if (!new_node) continue;
          const newnodestore = fnrf_zst.nodespace.get_node(new_node.id, false);
          if (!newnodestore) continue;
          node.new_id = new_node.id;

          onNodesChange([
            {
              id: new_node.id,
              type: "position",
              position: {
                x: node.position[0] + new_node.properties["frontend:pos"][0],
                y: node.position[1] + new_node.properties["frontend:pos"][1],
              },
            },
          ]);
        }

        for (const edge of copydata.edges) {
          const src_node = rel_node_infos.find(
            (node) => node.src_id === edge.src_nid
          );
          const trg_node = rel_node_infos.find(
            (node) => node.src_id === edge.trg_nid
          );
          if (!src_node || !trg_node) continue;
          if (!src_node.new_id || !trg_node.new_id) continue;
          edgeApi.add_edge({
            src_nid: src_node.new_id,
            src_ioid: edge.src_ioid,
            trg_nid: trg_node.new_id,
            trg_ioid: edge.trg_ioid,
          });
        }
      } catch (err) {
        console.error("Failed to process pasted data:", err);
      }
    },
    [nodeApi, edgeApi, fnrf_zst]
  );

  return func;
};
