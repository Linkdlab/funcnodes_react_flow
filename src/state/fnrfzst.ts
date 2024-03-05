import LibZustand, { LibZustandInterface } from "./lib";
import { FuncNodesWorker } from "../funcnodes";
import NodeSpaceZustand, {
  NodeSpaceZustandInterface,
  NodeType,
} from "./nodespace";
import { NodeStore, createNodeStore } from "./node";
import { PartialIOType } from "./node";
import reactflowstore, { RFStore } from "./reactflow";
import {
  Node as RFNode,
  NodeChange,
  useReactFlow,
  EdgeChange,
  Edge as RFEdge,
  Connection as RFConnection,
} from "reactflow";
import { NodeAction, PartialNodeType } from "./node";
import { deep_merge } from ".";
import { EdgeAction, generate_edge_id } from "./edge";

interface FuncNodesReactFlowZustandInterface {
  lib: LibZustandInterface;
  worker: FuncNodesWorker | undefined;
  nodespace: NodeSpaceZustandInterface;
  useReactFlowStore: RFStore;
  rf_instance?: ReturnType<typeof useReactFlow>;
  on_node_action: (action: NodeAction) => void;
  on_edge_action: (edge: EdgeAction) => void;
  reactflowRef: HTMLDivElement | null;
}

const _fill_node_frontend = (
  node: NodeType,
  fnrf_instance?: FuncNodesReactFlowZustandInterface
) => {
  const frontend = node.frontend || {};
  if (!frontend.pos) {
    if (
      !fnrf_instance ||
      !fnrf_instance.rf_instance ||
      fnrf_instance.reactflowRef === null
    ) {
      frontend.pos = [0, 0];
    } else {
      const ref = fnrf_instance.reactflowRef;
      const rect = ref.getBoundingClientRect(); // Step 2: Get bounding rectangle
      const centerX = rect.left + rect.width / 2; // Calculate center X
      const centerY = rect.top + rect.height / 2; // Calculate center Y
      const calcpos = fnrf_instance.rf_instance.screenToFlowPosition({
        x: centerX,
        y: centerY,
      });
      frontend.pos = [calcpos.x, calcpos.y];
    }
  }
  if (!frontend.size) {
    frontend.size = [200, 100];
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
    if (node.io[io].value === "<NoValue>") {
      node.io[io].value = undefined;
    }
  }

  const extendedNode: NodeType & RFNode = {
    position: {
      x: node.frontend.pos[0],
      y: node.frontend.pos[1],
    },
    data: {
      UseNodeStore: store,
    },
    type: "default",
    ...node,
  };

  return extendedNode;
};

const FuncNodesReactFlowZustand = (): FuncNodesReactFlowZustandInterface => {
  /*
  function that should be called when the remote node, e.g. in the python worker is performing an action
  */
  const on_node_action = (action: NodeAction) => {
    const rfstate = rfstore.getState();

    switch (action.type) {
      case "add":
        if (action.from_remote) {
          let store = ns.get_node(action.node.id, false);
          if (!store) {
            store = createNodeStore(action.node);
            ns.nodesstates.set(action.node.id, store);
          }

          const new_ndoes = [
            ...rfstate.nodes,
            assert_reactflow_node(action.node, store, iterf),
          ];
          rfstore.setState({ nodes: new_ndoes });
        }
        break;
      case "update":
        // some action reset the error, so far trigger does, so errors should remove the in_trigger flag
        if (action.node.in_trigger) {
          action.node.error = undefined;
        }
        if (action.from_remote) {
          const store = ns.get_node(action.id) as NodeStore;

          if (action.node.io) {
            for (const io in action.node.io) {
              const ioobj = action.node.io[io] as PartialIOType;
              // check if value in io, undefined is a valid value
              if (ioobj.hasOwnProperty("value")) {
                if (ioobj.value === undefined) {
                  ioobj.value = null;
                } else if (ioobj.value === "<NoValue>") {
                  ioobj.value = undefined;
                }
              }
            }
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
      case "error":
        console.error("Error", action);
        on_node_action({
          type: "update",
          id: action.id,
          node: {
            in_trigger: false,
            error: action.error,
          },
          from_remote: true,
        });
        break;

      case "trigger":
        if (action.from_remote) {
          on_node_action({
            type: "update",
            id: action.id,
            node: {
              in_trigger: true,
              error: undefined,
            },
            from_remote: true,
          });
        } else {
          iterf.worker?.trigger_node(action.id);
        }
        break;
      default:
        console.error("Unknown node action", action);
    }
  };

  const on_edge_action = (action: EdgeAction) => {
    const rfstate = rfstore.getState();

    switch (action.type) {
      case "add":
        if (action.from_remote) {
          const edges = rfstate.edges;
          const new_edge_id = generate_edge_id(action);

          //cehck if edge already exists including reversed
          if (edges.some((e) => e.id === new_edge_id)) {
            return;
          }
          const new_edge: RFEdge = {
            id: new_edge_id,
            source: action.src_nid,
            target: action.trg_nid,
            sourceHandle: action.src_ioid,
            targetHandle: action.trg_ioid,
            className: "funcnodes-edge animated",
          };

          rfstore.setState({ edges: [...edges, new_edge] });
        } else {
        }
        break;

      case "delete":
        if (action.from_remote) {
          const edges = rfstate.edges;
          const del_edge_id = generate_edge_id(action);
          const new_edges = edges.filter((edge) => edge.id !== del_edge_id);
          rfstore.setState({ edges: new_edges });
        } else {
        }
        break;
      default:
        console.error("Unknown edge action", action);
    }
  };
  /*
  on_node_cahnge is called by react flow when a note change event is fired
  should update the local state if something changed
  */
  const on_node_change = (nodechange: NodeChange[]) => {
    for (const change of nodechange) {
      switch (change.type) {
        case "position":
          if (change.position) {
            on_node_action({
              type: "update",
              id: change.id,
              node: {
                frontend: { pos: [change.position.x, change.position.y] },
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
                frontend: {
                  size: [change.dimensions.width, change.dimensions.height],
                },
              },
              from_remote: false,
            });
          }
          break;
      }
    }
  };

  const on_edge_change = (edgechange: EdgeChange[]) => {};

  const on_connect = (connection: RFConnection) => {
    if (
      connection.source === null ||
      connection.target === null ||
      connection.sourceHandle === null ||
      connection.targetHandle === null ||
      !iterf.worker
    ) {
      return;
    }
    iterf.worker.add_edge({
      src_nid: connection.source,
      src_ioid: connection.sourceHandle,
      trg_nid: connection.target,
      trg_ioid: connection.targetHandle,
      replace: true,
    });
  };

  const rfstore = reactflowstore({
    on_node_change,
    on_edge_change,
    on_connect,
  });
  const ns = NodeSpaceZustand({});
  const lib = LibZustand();
  const worker = undefined;

  const iterf: FuncNodesReactFlowZustandInterface = {
    lib: lib,
    worker: worker,
    nodespace: ns,
    useReactFlowStore: rfstore,
    on_node_action: on_node_action,
    on_edge_action: on_edge_action,
    reactflowRef: null,
  };
  return iterf;
};

export default FuncNodesReactFlowZustand;
export { LibZustand, NodeSpaceZustand };
export type { FuncNodesReactFlowZustandInterface };
