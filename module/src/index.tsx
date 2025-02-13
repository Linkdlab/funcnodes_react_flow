import React from "react";
import FuncnodesReactFlow, { FuncNodesContext } from "./frontend";
import WebSocketWorker from "./funcnodes/websocketworker";
import FuncNodesReactPlugin, {
  RendererPlugin,
  RenderPluginFactoryProps,
} from "./plugin";
import {
  InputRendererProps,
  IOType,
  OutputRendererProps,
} from "./states/nodeio.t";
import helperfunctions from "./utils/helperfunctions";
import FuncNodesReactFlowZustand, {
  FuncNodesReactFlowZustandInterface,
} from "./states";
import { FuncNodesWorker } from "./funcnodes";
import {
  HandlePreviewRendererType,
  DataOverlayRendererType,
  DataPreviewViewRendererType,
  DataViewRendererType,
  RenderMappingProvider,
} from "./frontend/datarenderer/rendermappings";
import { NodeType, PartialNodeType } from "./states/node.t";
import { FuncNodesAppOptions, ProgressState } from "./states/fnrfzst.t";
import ReactFlowLayer from "./frontend/funcnodesreactflow/react_flow_layer";
import { assert_full_node } from "./states/node";
import { deep_update } from "./utils";
import { WorkerProps } from "./funcnodes/funcnodesworker";
import { ConsoleLogger } from "./utils/logger";
export default FuncnodesReactFlow;

const FuncNodes = (props: FuncNodesAppOptions) => {
  const propscopy: FuncNodesAppOptions = { ...props };
  const logger = new ConsoleLogger(
    "FuncNodes",
    propscopy.debug ? "debug" : "info"
  );

  logger.debug("Initalizing FuncNodes with props:", propscopy);
  if (propscopy.worker === undefined) {
    if (propscopy.worker_url !== undefined) {
      propscopy.useWorkerManager = false;
      propscopy.worker = new WebSocketWorker({
        url: propscopy.worker_url,
        uuid: propscopy.id,
        on_sync_complete: propscopy.on_sync_complete,
      });
    }
  }
  if (propscopy.worker !== undefined) {
    const fnrf_zst = FuncNodesReactFlowZustand({
      useWorkerManager: propscopy.useWorkerManager,
      worker: propscopy.worker,
    });
    propscopy.worker.set_zustand(fnrf_zst);
  }
  logger.debug("Initalizing FuncnodesReactFlow with props:", propscopy);
  return (
    <div
      className="App"
      style={{
        height: "100%",
        width: "100%",
      }}
    >
      <FuncnodesReactFlow {...propscopy}></FuncnodesReactFlow>
    </div>
  );
};

export {
  WebSocketWorker,
  helperfunctions,
  FuncNodesReactFlowZustand,
  FuncNodes,
  FuncNodesContext,
  assert_full_node,
  ReactFlowLayer,
  RenderMappingProvider,
  deep_update,
  FuncNodesWorker,
};
export type {
  IOType,
  FuncNodesReactPlugin,
  RendererPlugin,
  RenderPluginFactoryProps,
  InputRendererProps,
  OutputRendererProps,
  FuncNodesReactFlowZustandInterface,
  HandlePreviewRendererType,
  DataOverlayRendererType,
  DataPreviewViewRendererType,
  DataViewRendererType,
  NodeType,
  PartialNodeType,
  ProgressState,
  WorkerProps,
  FuncNodesAppOptions,
};
