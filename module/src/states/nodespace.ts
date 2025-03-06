import { NodeStore } from "./node.t";
import {
  NodeSpaceZustandInterface,
  NodeSpaceZustandProps,
} from "./nodespace.t";
const NodeSpaceZustand =
  ({}: NodeSpaceZustandProps): NodeSpaceZustandInterface => {
    const nodesstates = new Map<string, NodeStore>();

    return {
      nodesstates: nodesstates,
      get_node: (nid: string, raise: boolean = true) => {
        const store = nodesstates.get(nid);
        if (!store && raise) {
          const keys = nodesstates.keys();
          throw new Error(
            `Node ${nid} not found, available nodes: ${Array.from(keys)}`,
          );
        }
        return store;
      },
    };
  };

export default NodeSpaceZustand;
