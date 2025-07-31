import * as React from "react";
import { MouseEvent } from "react";
import { useWorkerApi } from "@/workers";
import { LibNode } from "@/library";

export const LibraryNode = ({ item }: { item: LibNode }) => {
  const { node } = useWorkerApi();

  const add_to_flow = React.useCallback(() => {
    node?.add_node(item.node_id);
  }, [item.node_id, node]);

  const nodeclick = React.useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      // if double click, add node to graph
      if (event.detail === 2) {
        add_to_flow();
      }
    },
    [add_to_flow]
  );

  return (
    <div className="libnodeentry" onClick={nodeclick} title={item.description}>
      {item.node_name || item.node_id}
    </div>
  );
};
