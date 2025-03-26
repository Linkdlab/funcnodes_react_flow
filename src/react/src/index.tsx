import * as React from "react";
import FuncnodesReactFlow, {
  DEFAULT_FN_PROPS,
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
import { ConsoleLogger } from "./utils/logger";
import { remoteUrlToBase64 } from "./utils/data";
import { v4 as uuidv4 } from "uuid";
import { LimitedDeepPartial } from "./utils/objects";
import { NodeContext, NodeContextType } from "./frontend/node/node";
import { latest as latest_types } from "./types/versioned/versions.t";
import { v1 as v1_types } from "./types/versioned/versions.t";
import { v0 as v0_types } from "./types/versioned/versions.t";

const FuncNodes = (props: LimitedDeepPartial<FuncnodesReactFlowProps>) => {
  const logger = new ConsoleLogger("FuncNodes", props.debug ? "debug" : "info");

  logger.debug("Initalizing FuncNodes with props:", props);

  let fullprops: FuncnodesReactFlowProps = deep_update(props, {
    ...DEFAULT_FN_PROPS,
    id: uuidv4(),
  }).new_obj;

  if (props.worker === undefined) {
    if (props.worker_url !== undefined) {
      fullprops.useWorkerManager = false;
      fullprops.worker = new WebSocketWorker({
        url: props.worker_url,
        uuid: fullprops.id,
        on_sync_complete: fullprops.on_sync_complete,
      });
    }
  }
  if (fullprops.worker !== undefined) {
    const fnrf_zst = FuncNodesReactFlowZustand(fullprops);
    fullprops.worker.set_zustand(fnrf_zst);
  }

  if (props.fnw_url !== undefined) {
    // overwrite the worker.on_sync_complete temporarily to load the worker
    if (fullprops.worker === undefined) {
      throw new Error("defining fnw_url requires a worker to be defined");
    }
    const fnw_data_promise = remoteUrlToBase64(props.fnw_url);
    const o_on_sync_complete = fullprops.worker.on_sync_complete;
    const new_on_sync_complete = async (worker: FuncNodesWorker) => {
      const fnw_data = await fnw_data_promise;
      worker.on_sync_complete = o_on_sync_complete;
      await worker.update_from_export(fnw_data);
    };
    fullprops.worker.on_sync_complete = new_on_sync_complete;
  }

  logger.debug("Initalizing FuncnodesReactFlow with props:", fullprops);
  return (
    <div className="FuncnodesApp">
      <FuncnodesReactFlow {...fullprops}></FuncnodesReactFlow>
    </div>
  );
};

export default FuncNodes;
export {
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
