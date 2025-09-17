import {
  AbstractFuncNodesReactFlowHandleHandler,
  FuncNodesReactFlowHandlerContext,
} from "./rf-handlers.types";
import {
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  ReactFlowInstance,
  Connection,
} from "@xyflow/react";
import { AnyFuncNodesRFNode } from "@/nodes";
import { RFStore } from "../states";
import { reactflowstore } from "@/react-flow";

export interface ReactFlowManagerManagerAPI {
  useReactFlowStore: RFStore;
  rf_instance?: ReactFlowInstance<Node, Edge> | undefined;
}

export class ReactFlowManagerHandler
  extends AbstractFuncNodesReactFlowHandleHandler
  implements ReactFlowManagerManagerAPI
{
  useReactFlowStore: RFStore;
  rf_instance?: ReactFlowInstance<Node, Edge> | undefined;

  constructor(context: FuncNodesReactFlowHandlerContext) {
    super(context);
    this.useReactFlowStore = reactflowstore({
      on_node_change: this.on_rf_node_change.bind(this),
      on_edge_change: this.on_rf_edge_change.bind(this),
      on_connect: this.on_connect.bind(this),
    });
  }

  on_rf_node_change = (nodechange: NodeChange[]) => {
    const rfstate = this.useReactFlowStore.getState();

    for (const change of nodechange) {
      switch (change.type) {
        case "position":
          if (change.position) {
            const node = rfstate.getNode(change.id) as AnyFuncNodesRFNode;
            if (node === undefined) {
              continue;
            }
            if (node.type === "group") {
              this.nodespaceManager.change_group_position(change);
            } else {
              this.nodespaceManager.change_fn_node_position(change);
            }
            if (node.data.groupID) {
              this.nodespaceManager.auto_resize_group(node.data.groupID);
            }
          }
          break;
        case "dimensions":
          if (change.dimensions) {
            const node = rfstate.getNode(change.id);
            if (node === undefined) {
              continue;
            }
            if (node.type === "group") {
              this.nodespaceManager.change_group_dimensions(change);
            } else {
              this.nodespaceManager.change_fn_node_dimensions(change);
            }

            if (node.data.groupID) {
              this.nodespaceManager.auto_resize_group(
                node.data.groupID as string
              );
            }
          }
          break;
      }
    }
  };

  on_rf_edge_change = (_edgechange: EdgeChange[]) => {};

  on_connect = (connection: Connection) => {
    if (
      connection.source === null ||
      connection.target === null ||
      connection.sourceHandle === null ||
      connection.targetHandle === null ||
      !this.workerManager.worker
    ) {
      return;
    }
    const sourceMapping =
      this.nodespaceManager.get_collapsed_handle_mapping(
        connection.source,
        connection.sourceHandle
      );
    const targetMapping =
      this.nodespaceManager.get_collapsed_handle_mapping(
        connection.target,
        connection.targetHandle
      );
    const finalSource = sourceMapping
      ? sourceMapping.nodeId
      : connection.source;
    const finalSourceHandle = sourceMapping
      ? sourceMapping.ioId
      : connection.sourceHandle;
    const finalTarget = targetMapping
      ? targetMapping.nodeId
      : connection.target;
    const finalTargetHandle = targetMapping
      ? targetMapping.ioId
      : connection.targetHandle;
    this.workerManager.worker.api.edge.add_edge({
      src_nid: finalSource,
      src_ioid: finalSourceHandle,
      trg_nid: finalTarget,
      trg_ioid: finalTargetHandle,
      replace: true,
    });
  };
}
