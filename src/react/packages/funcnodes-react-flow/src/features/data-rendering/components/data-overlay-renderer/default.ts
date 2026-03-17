import { DataViewRendererToOverlayRenderer } from "../../utils";
import { DefaultDataViewRenderer, DictRenderer } from "../data-view-renderer";
import type { DataOverlayRendererType } from "./types";

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
