import { NodeStore } from "../nodes/interfaces";

export interface NodeSpaceZustandInterface {
  nodesstates: Map<string, NodeStore>;
  get_node: (nid: string, raise?: boolean) => NodeStore | undefined;
}
