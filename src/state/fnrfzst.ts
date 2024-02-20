import LibZustand, { LibZustandInterface } from "./lib";
import { FuncNodesWorker } from "../funcnodes";
import NodeSpaceZustand, {
  NodeSpaceZustandInterface,
  NodeType,
} from "./nodespace";
import { NodeStore, createNodeStore } from "./node";
import reactflowstore, { RFStore } from "./reactflow";
import { Node as RFNode, NodeChange, useReactFlow } from "reactflow";
import { NodeAction, PartialNodeType } from "./node";
import { deep_merge } from ".";

interface FuncNodesReactFlowZustandInterface {
  lib: LibZustandInterface;
  worker: FuncNodesWorker | undefined;
  nodespace: NodeSpaceZustandInterface;
  useReactFlowStore: RFStore;
  rf_instance?: ReturnType<typeof useReactFlow>;
  on_node_action: (action: NodeAction) => void;
  reactflowRef: HTMLDivElement | null;
}

const _fill_node_frontend = (
  node: NodeType,
  fnrf_instance?: FuncNodesReactFlowZustandInterface
) => {
  const frontend = node.frontend || {};
  if (!frontend.position) {
    if (
      !fnrf_instance ||
      !fnrf_instance.rf_instance ||
      fnrf_instance.reactflowRef === null
    ) {
      frontend.position = { x: 0, y: 0 };
    } else {
      const ref = fnrf_instance.reactflowRef;
      const rect = ref.getBoundingClientRect(); // Step 2: Get bounding rectangle
      const centerX = rect.left + rect.width / 2; // Calculate center X
      const centerY = rect.top + rect.height / 2; // Calculate center Y
      frontend.position = fnrf_instance.rf_instance.screenToFlowPosition({
        x: centerX,
        y: centerY,
      });
    }
  }
  if (!frontend.size) {
    frontend.size = { width: 100, height: 100 };
  }
  if (!frontend.collapsed) {
    frontend.collapsed = false;
  }
  node.frontend = frontend;
};
const assert_reactflow_node = (
  node: NodeType,
  store: NodeStore,
  fnrf_instance?: FuncNodesReactFlowZustandInterface
): NodeType & RFNode => {
  _fill_node_frontend(node, fnrf_instance);

  if (node.id === undefined) {
    throw new Error("Node must have an id");
  }

  for (const io in node.io) {
    node.io[io].node = node.id;
  }

  const extendedNode: NodeType & RFNode = {
    position: node.frontend.position,
    data: {
      UseNodeStore: store,
    },
    type: "default",
    ...node,
  };

  console.log("assert_reactflow_node", extendedNode);
  return extendedNode;
};

const FuncNodesReactFlowZustand = (): FuncNodesReactFlowZustandInterface => {
  /*
  function that should be called when the remote node, e.g. in the python worker is performing an action
  */
  const on_node_action = (action: NodeAction) => {
    console.debug("on_node_action", action);
    const rfstate = rfstore.getState();

    switch (action.type) {
      case "add":
        let store = ns.nodesstates.get(action.node.id);
        if (!store) {
          store = createNodeStore(action.node);
          ns.nodesstates.set(action.node.id, store);
        }

        const new_ndoes = [
          ...rfstate.nodes,
          assert_reactflow_node(action.node, store, iterf),
        ];
        console.log("new_ndoes", new_ndoes);
        rfstore.setState({ nodes: new_ndoes });
        break;
      case "update":
        if (action.from_remote) {
          const store = ns.nodesstates.get(action.id);
          if (!store) {
            throw new Error(`Node ${action.id} not found`);
          }
          const state = store.getState();
          const { new_obj, change } = deep_merge(state, action.node);
          if (change) {
            store.setState(new_obj);
          }
        } else {
          if (iterf.worker) {
            iterf.worker.update_node(action);
          }
        }
        break;
      case "delete":
        if (action.from_remote) {
          rfstore.getState().onNodesChange([
            {
              type: "remove",
              id: action.id,
            },
          ]);
        } else {
          iterf.worker?.remove_node(action.id);
        }
        break;
    }
  };

  /*
  on_node_cahnge is called by react flow when a note change event is fired
  should update the local state if something changed
  */
  const on_node_change = (nodechange: NodeChange[]) => {
    console.debug("on_node_change", nodechange);
    for (const change of nodechange) {
      switch (change.type) {
        case "position":
          if (change.position) {
            on_node_action({
              type: "update",
              id: change.id,
              node: {
                frontend: { position: change.position },
              },
              from_remote: false,
            });
          }
          break;
        case "dimensions":
          if (change.dimensions) {
            on_node_action({
              type: "update",
              id: change.id,
              node: {
                frontend: { size: change.dimensions },
              },
              from_remote: false,
            });
          }
          break;
      }
    }
  };
  const rfstore = reactflowstore({ on_node_change });
  const ns = NodeSpaceZustand({});
  const lib = LibZustand();
  const worker = undefined;

  const iterf: FuncNodesReactFlowZustandInterface = {
    lib: lib,
    worker: worker,
    nodespace: ns,
    useReactFlowStore: rfstore,
    on_node_action: on_node_action,
    reactflowRef: null,
  };
  return iterf;
};

export default FuncNodesReactFlowZustand;
export { LibZustand, NodeSpaceZustand };
export type { FuncNodesReactFlowZustandInterface };
