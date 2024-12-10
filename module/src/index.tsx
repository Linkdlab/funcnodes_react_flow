import React from "react";
import FuncnodesReactFlow from "./frontend";
import WebSocketWorker from "./funcnodes/websocketworker";
import FuncNodesReactPlugin, {
  RendererPlugin,
  RenderPluginFactoryProps,
} from "./plugin";
import { IOType } from "./states/nodeio.t";
import helperfunctions from "./utils/helperfunctions";
import FuncNodesReactFlowZustand from "./states";
import ReactDOM from "react-dom/client";

export default FuncnodesReactFlow;

const App = ({ id, ws_url }: { id: string; ws_url?: string }) => {
  let useWorkerManager = true;
  let worker = undefined;
  if (ws_url !== undefined) {
    useWorkerManager = false;
    worker = new WebSocketWorker({
      url: ws_url,
      uuid: id,
    });
    const fnrf_zst = FuncNodesReactFlowZustand({
      useWorkerManager: useWorkerManager,
      default_worker: worker,
    });
    worker.set_zustand(fnrf_zst);
  }
  return (
    <div
      className="App"
      style={{
        height: "100%",
        width: "100%",
      }}
    >
      <FuncnodesReactFlow
        id={id}
        useWorkerManager={useWorkerManager}
        default_worker={worker}
      ></FuncnodesReactFlow>
    </div>
  );
};

type FuncNodesWebOptions = {
  ws_url?: string;
};

const FuncNodes = (
  id_or_element: string | HTMLElement,
  options?: FuncNodesWebOptions
) => {
  let id: string;
  let element: HTMLElement;

  if (options === undefined) {
    options = {};
  }

  if (typeof id_or_element === "string") {
    id = id_or_element;
    element = document.getElementById(id) as HTMLElement;
  } else {
    element = id_or_element;
    id = element.id;
  }

  ReactDOM.createRoot(element).render(
    <React.StrictMode>
      <App id={id} ws_url={options.ws_url} />
    </React.StrictMode>
  );
};
// @ts-ignore
window.FuncNodes = FuncNodes;

// import ReactDOM from "react-dom";

// (async () => {
//   // @ts-ignore
//   window.React = await import("react");
// })();
// window.ReactDOM = ReactDOM;
// @ts-ignore
window.React = React;

export {
  WebSocketWorker,
  helperfunctions,
  FuncNodesReactFlowZustand,
  FuncNodes,
};
export type {
  IOType,
  FuncNodesReactPlugin,
  RendererPlugin,
  RenderPluginFactoryProps,
};
