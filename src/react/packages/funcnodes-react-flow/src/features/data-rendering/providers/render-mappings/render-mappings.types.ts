import {
  DataOverlayRendererType,
  DataPreviewViewRendererType,
  DataViewRendererType,
  HandlePreviewRendererType,
  InLineRendererType,
  InputRendererType,
  OutputRendererType,
} from "@/data-rendering-types";
import { RendererPlugin } from "@/plugins";
import { JSX } from "react";

export interface NodeRendererProps {
  // nodestore: NodeStore;
}
export type NodeRendererType = (renderprops: NodeRendererProps) => JSX.Element;

export type NodeHooksProps = {
  // nodestore: NodeStore;
};
export type NodeHooksType = (hookprops: NodeHooksProps) => JSX.Element;

// State shape for the render mappings
export interface RenderMappingState {
  Inputrenderer: { [key: string]: InputRendererType | undefined };
  Outputrenderer: { [key: string]: OutputRendererType | undefined };
  HandlePreviewRenderer: {
    [key: string]: HandlePreviewRendererType | undefined;
  };
  DataOverlayRenderer: {
    [key: string]: DataOverlayRendererType | undefined;
  };
  DataPreviewViewRenderer: {
    [key: string]: DataPreviewViewRendererType | undefined;
  };
  DataViewRenderer: { [key: string]: DataViewRendererType | undefined };
  InLineRenderer: { [key: string]: InLineRendererType | undefined };

  NodeRenderer: { [key: string]: NodeRendererType | undefined };
  NodeHooks: { [key: string]: NodeHooksType[] | undefined };
}

// Options for dispatching actions
export interface DispatchOptions {
  overwrite?: boolean;
}

// Action type interfaces
export interface ExtendInputRendererAction {
  type: "EXTEND_INPUT_RENDER";
  payload: { type: string; component: InputRendererType };
  options?: DispatchOptions;
}

export interface ExtendOutputRendererAction {
  type: "EXTEND_OUTPUT_RENDER";
  payload: { type: string; component: OutputRendererType };
  options?: DispatchOptions;
}

export interface ExtendHandlePreviewRendererAction {
  type: "EXTEND_HANDLE_PREVIEW_RENDER";
  payload: { type: string; component: HandlePreviewRendererType };
  options?: DispatchOptions;
}

export interface ExtendDataOverlayRendererAction {
  type: "EXTEND_DATA_OVERLAY_RENDER";
  payload: { type: string; component: DataOverlayRendererType };
  options?: DispatchOptions;
}

export interface ExtendDataPreviewRendererAction {
  type: "EXTEND_DATA_PREVIEW_RENDER";
  payload: { type: string; component: DataPreviewViewRendererType };
  options?: DispatchOptions;
}

export interface ExtendDataViewRendererAction {
  type: "EXTEND_DATA_VIEW_RENDER";
  payload: { type: string; component: DataViewRendererType };
  options?: DispatchOptions;
}

export interface ExtendFromPluginAction {
  type: "EXTEND_FROM_PLUGIN";
  payload: { plugin: RendererPlugin };
  options?: DispatchOptions;
}

export interface ExtendNodeRendererAction {
  type: "EXTEND_NODE_RENDERER";
  payload: { type: string; component: NodeRendererType };
  options?: DispatchOptions;
}

export interface ExtendNodeHooksAction {
  type: "EXTEND_NODE_HOOKS";
  payload: { type: string; component: NodeHooksType[] };
  options?: DispatchOptions;
}

// Union type for all possible actions
export type RenderMappingAction =
  | ExtendInputRendererAction
  | ExtendOutputRendererAction
  | ExtendHandlePreviewRendererAction
  | ExtendDataOverlayRendererAction
  | ExtendDataPreviewRendererAction
  | ExtendDataViewRendererAction
  | ExtendFromPluginAction
  | ExtendNodeRendererAction
  | ExtendNodeHooksAction;
