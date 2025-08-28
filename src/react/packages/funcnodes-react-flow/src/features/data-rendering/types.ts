export type {
  DataViewRendererType,
  DataViewRendererProps,
  InLineRendererType,
  InLineRendererProps,
  DataOverlayRendererType,
  DataOverlayRendererProps,
  DataPreviewViewRendererType,
  DataPreviewViewRendererProps,
  HandlePreviewRendererType,
  HandlePreviewRendererProps,
  OutputRendererType,
  OutputRendererProps,
  InputRendererType,
  InputRendererProps,
} from "./components/types";
export type {
  ExtendInputRendererAction,
  ExtendOutputRendererAction,
  ExtendHandlePreviewRendererAction,
  ExtendDataOverlayRendererAction,
  ExtendDataPreviewRendererAction,
  ExtendDataViewRendererAction,
  ExtendFromPluginAction,
  ExtendNodeRendererAction,
  ExtendNodeHooksAction,
  RenderMappingAction,
  NodeRendererType,
  NodeRendererProps,
  NodeHooksType,
  NodeHooksProps,
} from "./providers/types";

export interface RenderOptions {
  typemap?: { [key: string]: string | undefined };
  inputconverter?: { [key: string]: string | undefined };
}
