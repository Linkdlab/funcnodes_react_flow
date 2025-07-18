import * as React from "react";
import { MouseEvent } from "react";
import { useFuncNodesContext } from "@/providers";
import { FuncNodesReactFlowZustandInterface, LibNode } from "@/barrel_imports";

export const LibraryNode = ({ item }: { item: LibNode }) => {
  const zustand: FuncNodesReactFlowZustandInterface = useFuncNodesContext();

  const add_to_flow = () => {
    zustand.worker?.add_node(item.node_id);
  };

  const nodeclick = (event: MouseEvent<HTMLDivElement>) => {
    // if double click, add node to graph
    if (event.detail === 2) {
      add_to_flow();
    }
  };

  return (
    <div className="libnodeentry" onClick={nodeclick} title={item.description}>
      {item.node_name || item.node_id}
    </div>
  );
};
