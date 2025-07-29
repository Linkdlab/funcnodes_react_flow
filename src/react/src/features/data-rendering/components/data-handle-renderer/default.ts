import {
  DefaultDataPreviewViewRenderer,
  FallbackDataPreviewViewRenderer,
  DataPreviewViewRendererToHandlePreviewRenderer,
} from "@/data-rendering";
import { HandlePreviewRendererType } from ".";

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
