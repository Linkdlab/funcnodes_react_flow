import { createContext, useEffect, useState } from "react";
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
} from "../../states/fnrfzst.t";
import { RenderMappingProvider } from "../datarenderer/rendermappings";
import { NodeSettings } from "../node";

const FuncNodesContext = createContext<FuncNodesReactFlowZustandInterface>(
  FuncNodesReactFlowZustand({})
);

const InnerFuncnodesReactFlow = ({
  fnrf_zst,
  header,
}: {
  fnrf_zst: FuncNodesReactFlowZustandInterface;
  header: FuncnodesReactHeaderProps;
}) => {
  const [workermanageruri, setWorkermanageruri] = useState<string>("");
  const [worker, setWorker] = useState<FuncNodesWorker | undefined>(
    fnrf_zst.options.default_worker
  );

  useEffect(() => {
    async function fetch_worker_manager() {
      let response = await fetch("/worker_manager");
      let workerewsuri = await response.text();
      setWorkermanageruri(workerewsuri);
    }
    if (fnrf_zst.options.useWorkerManager) fetch_worker_manager();
  }, []);

  useEffect(() => {
    if (workermanageruri) {
      const workermanager = new WorkerManager(workermanageruri, fnrf_zst);
      workermanager.on_setWorker = setWorker;
      fnrf_zst.workermanager = workermanager;
    }
  }, [workermanageruri]);

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
            <ReactFlowLayer></ReactFlowLayer>
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
  default_worker = undefined,
  on_sync_complete = undefined,
  header = {},
  id,
}: FuncnodesReactFlowProps) => {
  if (!useWorkerManager && default_worker === undefined) {
    return (
      <div>
        Error: If you don't use a worker manager, you must provide a default
        worker.
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
      default_worker,
      on_sync_complete,
    });
    FUNCNODESREACTFLOW_MAPPER[id] = fnrf_zst;
  }

  if (default_worker) {
    default_worker.set_zustand(FUNCNODESREACTFLOW_MAPPER[id]);
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
