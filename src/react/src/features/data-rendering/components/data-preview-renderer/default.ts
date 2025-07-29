import { DataPreviewViewRendererType } from ".";
import {
  Base64BytesRenderer,
  DefaultDataViewRenderer,
  DefaultImageRenderer,
  DictRenderer,
  StringValueRenderer,
  SVGImageRenderer,
  TableRender,
  DataViewRendererToDataPreviewViewRenderer,
} from "@/data-rendering";

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
