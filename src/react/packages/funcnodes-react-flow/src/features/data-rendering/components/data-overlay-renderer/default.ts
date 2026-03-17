import { DataViewRendererToOverlayRenderer } from "../../utils";
import { DefaultDataViewRenderer } from "../data-view-renderer/defaults";
import { DictRenderer } from "../data-view-renderer/json";
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
