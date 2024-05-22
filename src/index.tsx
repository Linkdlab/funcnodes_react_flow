import FuncnodesReactFlow from "./frontend";
import WebSocketWorker from "./funcnodes/websocketworker";
import FuncNodesReactPlugin, { RendererPlugin } from "./plugin";
import { IOType } from "./states/nodeio.t";
export default FuncnodesReactFlow;

import ReactDOM from "react-dom";

(async () => {
  // @ts-ignore
  window.React = await import("react");
})();
// // @ts-ignore
// window.React.default = React;
window.ReactDOM = ReactDOM;

export { WebSocketWorker };
export type { IOType, FuncNodesReactPlugin, RendererPlugin };
