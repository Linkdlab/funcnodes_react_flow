import * as React from "react";
import { createContext, useState } from "react";
import FuncNodesWorker from "../../funcnodes/funcnodesworker";
import FuncNodesReactFlowZustand from "../../states/fnrfzst";

import { WorkerManager } from "../../funcnodes";

import FuncnodesHeader from "../header";
import Library from "../lib";
import ReactFlowLayer from "./react_flow_layer";
import {
  FuncNodesReactFlowZustandInterface,
  FuncnodesReactFlowProps,
  FuncnodesReactHeaderProps,
  ReactFlowLayerProps,
  ReactFlowLibraryProps,
} from "../../states/fnrfzst.t";
import { RenderMappingProvider } from "../datarenderer/rendermappings";
import { NodeSettings } from "../node";
import { deep_update } from "../../utils";
import { v4 as uuidv4 } from "uuid";
import {
  FullscreenIcon,
  FullscreenExitIcon,
  OpenInFullIcon,
  CloseFullscreenIcon,
} from "../assets/mui";
import SmoothExpandComponent from "../layout/smoothexpand";
import FullScreenComponent from "../layout/fullscreenelement";

const InnerFuncnodesReactFlow = ({
  fnrf_zst,
  header,
  flow,
  library,
}: {
  fnrf_zst: FuncNodesReactFlowZustandInterface;
  header: FuncnodesReactHeaderProps;
  flow: ReactFlowLayerProps;
  library: ReactFlowLibraryProps;
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
        <SmoothExpandComponent asChild>
          <FullScreenComponent asChild>
            <div className="funcnodesreactflowcontainer funcnodescontainer">
              {header.show && <FuncnodesHeader {...header}></FuncnodesHeader>}

              <div className="funcnodesreactflowbody">
                {worker && library.show && <Library></Library>}
                <ReactFlowLayer {...flow}></ReactFlowLayer>
                {worker && <NodeSettings></NodeSettings>}
              </div>
              <div className="funcnodesflaotingmenu">
                <FullScreenComponent.OutFullScreen>
                  {flow.allowExpand && (
                    <SmoothExpandComponent.Trigger>
                      <SmoothExpandComponent.Expanded>
                        <CloseFullscreenIcon />
                      </SmoothExpandComponent.Expanded>
                      <SmoothExpandComponent.Collapsed>
                        <OpenInFullIcon />
                      </SmoothExpandComponent.Collapsed>
                    </SmoothExpandComponent.Trigger>
                  )}
                </FullScreenComponent.OutFullScreen>
                {flow.allowFullScreen && (
                  <FullScreenComponent.Trigger>
                    <FullScreenComponent.OutFullScreen>
                      <FullscreenIcon />
                    </FullScreenComponent.OutFullScreen>
                    <FullScreenComponent.InFullScreen>
                      <FullscreenExitIcon />
                    </FullScreenComponent.InFullScreen>
                  </FullScreenComponent.Trigger>
                )}
              </div>
            </div>
          </FullScreenComponent>
        </SmoothExpandComponent>
      </FuncNodesContext.Provider>
    </RenderMappingProvider>
  );
};

const FUNCNODESREACTFLOW_MAPPER: {
  [key: string]: FuncNodesReactFlowZustandInterface;
} = {};

const DEFAULT_LIB_PROPS: ReactFlowLibraryProps = {
  show: true,
};

const DEFAULT_HEADER_PROPS: FuncnodesReactHeaderProps = {
  show: true,
  showmenu: true,
};

const DEFAULT_FLOW_PROPS: ReactFlowLayerProps = {
  minimap: true,
  static: false,
  minZoom: 0.1,
  maxZoom: 5,
  allowFullScreen: true,
  allowExpand: true,
};

const DEFAULT_FN_PROPS: FuncnodesReactFlowProps = {
  id: "", // required
  debug: false,
  useWorkerManager: true,
  show_library: true,
  header: DEFAULT_HEADER_PROPS,
  flow: DEFAULT_FLOW_PROPS,
  library: DEFAULT_LIB_PROPS,
};

const FuncNodesContext = createContext<FuncNodesReactFlowZustandInterface>(
  FuncNodesReactFlowZustand(DEFAULT_FN_PROPS)
);

const FuncnodesReactFlow = (fnprops: Partial<FuncnodesReactFlowProps>) => {
  let fullprops: FuncnodesReactFlowProps = deep_update(fnprops, {
    ...DEFAULT_FN_PROPS,
    id: uuidv4(),
  }).new_obj;

  if (!fullprops.useWorkerManager && fullprops.worker === undefined) {
    return (
      <div>
        Error: If you don't use a worker manager, you must provide a default
        worker.
      </div>
    );
  }

  if (fnprops.useWorkerManager && fnprops.workermanager_url === undefined) {
    return (
      <div>
        Error: If you use a worker manager, you must provide a worker manager
        url.
      </div>
    );
  }

  // @ts-ignore
  if (window.fnrf_zst === undefined) {
    // @ts-ignore
    window.fnrf_zst = FUNCNODESREACTFLOW_MAPPER;
  }

  if (FUNCNODESREACTFLOW_MAPPER[fullprops.id] === undefined) {
    const fnrf_zst = FuncNodesReactFlowZustand(fullprops);
    FUNCNODESREACTFLOW_MAPPER[fullprops.id] = fnrf_zst;
  }

  if (fullprops.worker) {
    fullprops.worker.set_zustand(FUNCNODESREACTFLOW_MAPPER[fullprops.id]);
  }

  FUNCNODESREACTFLOW_MAPPER[fullprops.id].options.debug = fullprops.debug;

  if (fullprops.useWorkerManager) {
    const workermanager = new WorkerManager(
      fullprops.workermanager_url as string,
      FUNCNODESREACTFLOW_MAPPER[fullprops.id]
    );
    FUNCNODESREACTFLOW_MAPPER[fullprops.id].workermanager = workermanager;
  }

  return (
    <InnerFuncnodesReactFlow
      fnrf_zst={FUNCNODESREACTFLOW_MAPPER[fullprops.id]}
      header={fullprops.header}
      library={fullprops.library}
      flow={fullprops.flow}
    />
  );
};

export default FuncnodesReactFlow;
export { FuncNodesContext, DEFAULT_FN_PROPS };
