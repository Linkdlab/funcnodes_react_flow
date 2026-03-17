import { DefaultDataOverlayRenderer } from "../../components/data-overlay-renderer/default";
import { DefaultHandlePreviewRenderer } from "../../components/data-handle-renderer/default";
import { DefaultInLineRenderer } from "../../components/inline-renderer/default";
import { DefaultInputRenderer } from "../../components/input-renderer/default";
import { DefaultOutputRenderer } from "../../components/output-renderer/default";
import { DefaultDataPreviewViewRenderer } from "../../components/data-preview-renderer/default";
import { DefaultDataViewRenderer } from "../../components/data-view-renderer/defaults";
import type {
  NodeHooksType,
  NodeRendererType,
  RenderMappingState,
} from "./render-mappings.types";

const _NodeRenderer: { [key: string]: NodeRendererType | undefined } = {};
const _NodeHooks: { [key: string]: NodeHooksType[] | undefined } = {};

export const initialRenderMappings: RenderMappingState = {
  Inputrenderer: DefaultInputRenderer,
  Outputrenderer: DefaultOutputRenderer,
  HandlePreviewRenderer: DefaultHandlePreviewRenderer,
  DataOverlayRenderer: DefaultDataOverlayRenderer,
  DataPreviewViewRenderer: DefaultDataPreviewViewRenderer,
  DataViewRenderer: DefaultDataViewRenderer,
  InLineRenderer: DefaultInLineRenderer,
  NodeRenderer: _NodeRenderer,
  NodeHooks: _NodeHooks,
};
