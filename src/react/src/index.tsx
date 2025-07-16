import * as React from "react";
import FuncnodesReactFlow, {
  FuncNodesContext,
} from "./frontend/funcnodesreactflow";
import WebSocketWorker from "./funcnodes/websocketworker";
import helperfunctions from "./utils/helperfunctions";
import FuncNodesReactFlowZustand from "./states";
import { FuncNodesWorker } from "./funcnodes";
import {
  RenderMappingProvider,
  RenderMappingContext,
} from "./frontend/datarenderer/rendermappings";

import {
  FuncnodesReactFlowProps,
  FuncNodesReactFlowZustandInterface,
  ProgressState,
} from "./states/fnrfzst.t";
import ReactFlowLayer from "./frontend/funcnodesreactflow/react_flow_layer";
import { deep_update } from "./utils";
import { WorkerProps } from "./funcnodes/funcnodesworker";

import { LimitedDeepPartial } from "./utils/objects";
import { NodeContext, NodeContextType } from "./frontend/node/node";
import { latest as latest_types } from "./types/versioned/versions.t";
import { v1 as v1_types } from "./types/versioned/versions.t";
import { v0 as v0_types } from "./types/versioned/versions.t";
import "./index.scss";
const FuncNodes = (props: LimitedDeepPartial<FuncnodesReactFlowProps>) => {
  return (
    <div className="FuncnodesApp">
      <FuncnodesReactFlow {...props}></FuncnodesReactFlow>
    </div>
  );
};

export {
  FuncNodes,
  WebSocketWorker,
  helperfunctions,
  FuncNodesReactFlowZustand,
  FuncNodesContext,
  ReactFlowLayer,
  RenderMappingProvider,
  deep_update,
  FuncNodesWorker,
  FuncnodesReactFlow,
  NodeContext,
  RenderMappingContext,
};

export type {
  FuncNodesReactFlowZustandInterface,
  ProgressState,
  WorkerProps,
  FuncnodesReactFlowProps,
  NodeContextType,
  latest_types,
  v1_types,
  v0_types,
};
