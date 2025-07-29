import {
  DataViewRendererToOverlayRenderer,
  DefaultDataViewRenderer,
  DictRenderer,
} from "@/data-rendering";
import { DataOverlayRendererType } from ".";

export const DefaultDataOverlayRenderer: {
  [key: string]: DataOverlayRendererType | undefined;
} = {
  ...Object.fromEntries(
    Object.entries(DefaultDataViewRenderer).map(([key, value]) => [
      key,
      value ? DataViewRendererToOverlayRenderer(value) : undefined,
    ])
  ),
};
export const FallbackOverlayRenderer: DataOverlayRendererType =
  DataViewRendererToOverlayRenderer(DictRenderer);
