declare global {
  interface Window {
    FuncNodes: any;
  }
}
import { createRoot } from "react-dom/client";

import * as React from "react";
import {
  ConsoleLogger,
  DivLogger,
  BaseLogger,
  DEBUG,
  ERROR,
  INFO,
  WARN,
} from "@/logging";
import { FuncNodes, FuncnodesReactFlowProps } from "@/app";
import "./index.scss";

declare const __FN_VERSION__: string;

export const FuncNodesRenderer = (
  id_or_element: string | HTMLElement,
  options?: Partial<FuncnodesReactFlowProps>
) => {
  if (options === undefined) {
    options = {};
  }

  const { element, eleid } =
    typeof id_or_element === "string"
      ? {
          element: document.getElementById(id_or_element) as HTMLElement,
          eleid: id_or_element,
        }
      : { element: id_or_element, eleid: id_or_element.id };

  createRoot(element).render(
    <React.StrictMode>
      <FuncNodes {...options} id={options.id || eleid} />
    </React.StrictMode>
  );
};

window.FuncNodes = FuncNodesRenderer;
window.FuncNodes.version = __FN_VERSION__;
window.FuncNodes.utils = {
  logger: {
    ConsoleLogger,
    DivLogger,
    BaseLogger,
    DEBUG,
    INFO,
    WARN,
    ERROR,
  },
};

export type {
  FuncNodesReactPlugin,
  VersionedFuncNodesReactPlugin,
  RenderPluginFactoryProps,
  RendererPlugin,
} from "@/plugins";
export { LATEST_VERSION } from "@/plugins";
export type {
  InputRendererType,
  InputRendererProps,
  OutputRendererType,
  OutputRendererProps,
  HandlePreviewRendererType,
  HandlePreviewRendererProps,
  DataOverlayRendererType,
  DataOverlayRendererProps,
  DataPreviewViewRendererType,
  DataPreviewViewRendererProps,
  DataViewRendererType,
  DataViewRendererProps,
  InLineRendererType,
  InLineRendererProps,
  NodeRendererType,
  NodeRendererProps,
  NodeHooksType,
  NodeHooksProps,
} from "@/data-rendering-types";
export {
  DataViewRendererToOverlayRenderer,
  DataViewRendererToDataPreviewViewRenderer,
  DataPreviewViewRendererToHandlePreviewRenderer,
  DataViewRendererToInputRenderer,
} from "@/data-rendering";
export { useNodeStore, useIOStore } from "@/nodes";
export type {
  PartialSerializedNodeType,
  SerializedNodeType,
} from "@/nodes-core";
export {
  useSetIOValue,
  useIOValueStore,
  useSetIOValueOptions,
  useIOGetFullValue,
} from "@/nodes-io-hooks";
export { useWorkerApi } from "@/workers";
export { useFuncNodesContext } from "@/providers";

export {
  DataStructure,
  ArrayBufferDataStructure,
  CTypeStructure,
  JSONStructure,
  TextStructure,
} from "@/data-structures";

export { FuncNodes } from "@/app";
export type { FuncnodesReactFlowProps } from "@/app";

export { FuncNodesWorker } from "@/workers";
export type { WorkerProps } from "@/workers";

export {
  object_factory_maker,
  deep_update,
  deep_merge,
} from "@/object-helpers";
export type { LimitedDeepPartial, DeepPartial } from "@/object-helpers";

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

// import FuncnodesReactFlow, {
//   FuncNodesContext,
// } from "./frontend/funcnodesreactflow";
// import WebSocketWorker from "./funcnodes/websocketworker";
// import helperfunctions from "./utils/helperfunctions";
// import FuncNodesReactFlowZustand from "./states";
// import { FuncNodesWorker } from "./funcnodes";
// import {
//   RenderMappingProvider,
//   RenderMappingContext,
// } from "./frontend/datarenderer/rendermappings";

// import {
//   FuncnodesReactFlowProps,
//   FuncNodesReactFlowZustandInterface,
//   ProgressState,
// } from "./states/fnrfzst.t";
// import ReactFlowLayer from "./frontend/funcnodesreactflow/react_flow_layer";
// import { deep_update } from "./utils";
// import { WorkerProps } from "./funcnodes/funcnodesworker";

// import { LimitedDeepPartial } from "./utils/objects";
// import { NodeContext, NodeContextType } from "./frontend/node/node";
// import { latest as latest_types } from "./types/versioned/versions.t";
// import { v1 as v1_types } from "./types/versioned/versions.t";
// import { v0 as v0_types } from "./types/versioned/versions.t";
// import "./index.scss";
// import { FuncNodes } from "./app/app";

// export {
//   FuncNodes,
//   WebSocketWorker,
//   helperfunctions,
//   FuncNodesReactFlowZustand,
//   FuncNodesContext,
//   ReactFlowLayer,
//   RenderMappingProvider,
//   deep_update,
//   FuncNodesWorker,
//   FuncnodesReactFlow,
//   NodeContext,
//   RenderMappingContext,
// };

// export type {
//   FuncNodesReactFlowZustandInterface,
//   ProgressState,
//   WorkerProps,
//   FuncnodesReactFlowProps,
//   NodeContextType,
//   latest_types,
//   v1_types,
//   v0_types,
// };
