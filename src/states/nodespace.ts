import { NodeStore } from "./node.t";
import {
  NodeSpaceZustandInterface,
  NodeSpaceZustandProps,
} from "./nodespace.t";
const NodeSpaceZustand =
  ({}: NodeSpaceZustandProps): NodeSpaceZustandInterface => {
    const nodesstates = new Map<string, NodeStore>();

    // const update_node = ({
    //   nid,
    //   node,
    //   from_remote,
    // }: {
    //   nid: string;
    //   node: PartialNodeType;
    //   from_remote: boolean;
    // }) => {};
    // const add_node = ({
    //   node,
    //   from_remote,
    // }: {
    //   node: NodeType;
    //   from_remote: boolean;
    // }) => {
    //   node = assert_full_node(node);
    //   const store = nodesstates.get(node.id);

    //   if (store) {
    //     update_node({ nid: node.id, node: node, from_remote });
    //   } else {
    //     nodesstates.set(node.id, createNodeStore(node));

    //     _on_node_action({
    //       type: "add",
    //       node: node,
    //       id: node.id,
    //       from_remote: from_remote,
    //     });
    //   }
    // };

    // const set_value = ({
    //   node,
    //   io,
    //   value,
    //   set_default,
    // }: {
    //   node: string;
    //   io: string;
    //   value: any;
    //   set_default?: boolean;
    // }) => {
    //   const store = nodesstates.get(node);
    //   if (store) {
    //     const state = store.getState();
    //     if (!state.io[io]) {
    //       throw new Error(`IO ${io} not found in node ${node}`);
    //     }
    //     const new_state: PartialNodeType = {
    //       io: {
    //         [io]: {
    //           value: value,
    //         },
    //       },
    //     };

    //     update_node({ nid: node, node: new_state, from_remote: false });
    //   }
    // };

    return {
      nodesstates: nodesstates,
      get_node: (nid: string, raise: boolean = true) => {
        const store = nodesstates.get(nid);
        if (!store && raise) {
          const keys = nodesstates.keys();
          throw new Error(
            `Node ${nid} not found, available nodes: ${Array.from(keys)}`
          );
        }
        return store;
      },
      // add_node: add_node,
      // update_node: update_node,
      // set_value: set_value,
    };
  };

export default NodeSpaceZustand;
