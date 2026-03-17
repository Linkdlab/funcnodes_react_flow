import { DataViewRendererToDataPreviewViewRenderer } from "../../utils";
import { Base64BytesRenderer } from "../data-view-renderer/bytes";
import { DefaultDataViewRenderer } from "../data-view-renderer/defaults";
import { DefaultImageRenderer, SVGImageRenderer } from "../data-view-renderer/images";
import { DictRenderer } from "../data-view-renderer/json";
import { TableRender } from "../data-view-renderer/tables";
import { StringValueRenderer } from "../data-view-renderer/text";
import type { DataPreviewViewRendererType } from "./types";

export const DefaultDataPreviewViewRenderer: {
  [key: string]: DataPreviewViewRendererType | undefined;
} = {
  ...Object.fromEntries(
    Object.entries(DefaultDataViewRenderer).map(([key, value]) => [
      key,
      value ? DataViewRendererToDataPreviewViewRenderer(value) : undefined,
    ])
  ),
  string: DataViewRendererToDataPreviewViewRenderer(StringValueRenderer),
  str: DataViewRendererToDataPreviewViewRenderer(StringValueRenderer),
  table: DataViewRendererToDataPreviewViewRenderer(TableRender, undefined, {
    pageSize: 10,
  }),
  image: DataViewRendererToDataPreviewViewRenderer(DefaultImageRenderer),
  svg: DataViewRendererToDataPreviewViewRenderer(SVGImageRenderer, ""),
  dict: DataViewRendererToDataPreviewViewRenderer(DictRenderer, "{}"),
  bytes: DataViewRendererToDataPreviewViewRenderer(Base64BytesRenderer, ""),
};

export const FallbackDataPreviewViewRenderer: DataPreviewViewRendererType =
  DataViewRendererToDataPreviewViewRenderer(DictRenderer);
