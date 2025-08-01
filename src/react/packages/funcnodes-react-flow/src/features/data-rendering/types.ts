export type {
  DataViewRendererType,
  DataViewRendererProps,
  InLineRendererType,
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
  NodeHooksType,
} from "./providers/types";

export interface RenderOptions {
  typemap?: { [key: string]: string | undefined };
  inputconverter?: { [key: string]: string | undefined };
}
