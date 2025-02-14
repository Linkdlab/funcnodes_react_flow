import { createContext, useState } from "react";
import FuncNodesWorker from "../../funcnodes/funcnodesworker";
import FuncNodesReactFlowZustand from "../../states/fnrfzst";
import React from "react";
import { WorkerManager } from "../../funcnodes";

import FuncnodesHeader from "../header";
import Library from "../lib";
import ReactFlowLayer from "./react_flow_layer";
import {
  FuncNodesReactFlowZustandInterface,
  FuncnodesReactFlowProps,
  FuncnodesReactHeaderProps,
  ReactFlowLayerProps,
} from "../../states/fnrfzst.t";
import { RenderMappingProvider } from "../datarenderer/rendermappings";
import { NodeSettings } from "../node";

const FuncNodesContext = createContext<FuncNodesReactFlowZustandInterface>(
  FuncNodesReactFlowZustand({})
);

const InnerFuncnodesReactFlow = ({
  fnrf_zst,
  header,
  flow,
}: {
  fnrf_zst: FuncNodesReactFlowZustandInterface;
  header?: FuncnodesReactHeaderProps;
  flow?: ReactFlowLayerProps;
}) => {
  const [worker, setWorker] = useState<FuncNodesWorker | undefined>(
    fnrf_zst.options.worker
  );

  if (fnrf_zst.workermanager) {
    fnrf_zst.workermanager.on_setWorker = setWorker;
  }

  fnrf_zst.set_worker(worker);

  fnrf_zst.auto_progress();
  // const worker = new WebSocketWorker("ws://localhost:9382", fnrf_zst);
  // fnrf_zst.worker = worker;
  const plugins = fnrf_zst.plugins();

  return (
    <RenderMappingProvider plugins={plugins} fnrf_zst={fnrf_zst}>
      <FuncNodesContext.Provider value={fnrf_zst}>
        <div className="funcnodesreactflowcontainer">
          <FuncnodesHeader {...header}></FuncnodesHeader>

          <div className="funcnodesreactflowbody">
            <Library></Library>
            <ReactFlowLayer {...flow}></ReactFlowLayer>
            <NodeSettings></NodeSettings>
          </div>
        </div>
      </FuncNodesContext.Provider>
    </RenderMappingProvider>
  );
};

const FUNCNODESREACTFLOW_MAPPER: {
  [key: string]: FuncNodesReactFlowZustandInterface;
} = {};

const FuncnodesReactFlow = ({
  useWorkerManager = true,
  workerManagerUrl = undefined,
  worker = undefined,
  on_sync_complete = undefined,
  header = {},
  debug = false,
  id,
}: FuncnodesReactFlowProps) => {
  if (!useWorkerManager && worker === undefined) {
    return (
      <div>
        Error: If you don't use a worker manager, you must provide a default
        worker.
      </div>
    );
  }

  if (useWorkerManager && workerManagerUrl === undefined) {
    return (
      <div>
        Error: If you use a worker manager, you must provide a worker manager
        url.
      </div>
    );
  }

  if (id === undefined || id === null) {
    id = "fnrf_" + Math.random().toString(36).substring(7);
  }

  // @ts-ignore
  if (window.fnrf_zst === undefined) {
    // @ts-ignore
    window.fnrf_zst = FUNCNODESREACTFLOW_MAPPER;
  }

  if (FUNCNODESREACTFLOW_MAPPER[id] === undefined) {
    const fnrf_zst = FuncNodesReactFlowZustand({
      useWorkerManager,
      worker: worker,
      on_sync_complete,
    });
    FUNCNODESREACTFLOW_MAPPER[id] = fnrf_zst;
  }

  if (worker) {
    worker.set_zustand(FUNCNODESREACTFLOW_MAPPER[id]);
  }

  FUNCNODESREACTFLOW_MAPPER[id].options.debug = debug;

  if (useWorkerManager) {
    const workermanager = new WorkerManager(
      workerManagerUrl as string,
      FUNCNODESREACTFLOW_MAPPER[id]
    );
    FUNCNODESREACTFLOW_MAPPER[id].workermanager = workermanager;
  }

  return (
    <InnerFuncnodesReactFlow
      fnrf_zst={FUNCNODESREACTFLOW_MAPPER[id]}
      header={header}
    />
  );
};

export default FuncnodesReactFlow;
export { FuncNodesContext };
