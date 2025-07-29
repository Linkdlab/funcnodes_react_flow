import { DataPreviewViewRendererToHandlePreviewRenderer } from "../../utils";
import {
  DefaultDataPreviewViewRenderer,
  FallbackDataPreviewViewRenderer,
} from "../data-preview-renderer";
import { HandlePreviewRendererType } from "./types";

export const DefaultHandlePreviewRenderer: {
  [key: string]: HandlePreviewRendererType | undefined;
} = {
  ...Object.fromEntries(
    Object.entries(DefaultDataPreviewViewRenderer).map(([key, value]) => [
      key,
      value ? DataPreviewViewRendererToHandlePreviewRenderer(value) : undefined,
    ])
  ),
};

export const FallbackHandlePreviewRenderer: HandlePreviewRendererType =
  DataPreviewViewRendererToHandlePreviewRenderer(
    FallbackDataPreviewViewRenderer
  );
