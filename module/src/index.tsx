import React from "react";
import FuncnodesReactFlow from "./frontend";
import WebSocketWorker from "./funcnodes/websocketworker";
import FuncNodesReactPlugin, {
  RendererPlugin,
  RenderPluginFactoryProps,
} from "./plugin";
import { IOType } from "./states/nodeio.t";
import helperfunctions from "./utils/helperfunctions";

export default FuncnodesReactFlow;

// import ReactDOM from "react-dom";

// (async () => {
//   // @ts-ignore
//   window.React = await import("react");
// })();
// window.ReactDOM = ReactDOM;
// @ts-ignore
window.React = React;

export { WebSocketWorker, helperfunctions };
export type {
  IOType,
  FuncNodesReactPlugin,
  RendererPlugin,
  RenderPluginFactoryProps,
};
