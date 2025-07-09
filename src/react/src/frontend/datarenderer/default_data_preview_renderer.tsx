import * as React from "react";
import { latest } from "../../types/versioned/versions.t";
import {
  Base64BytesRenderer,
  DefaultImageRenderer,
  DictRenderer,
  StringValueRenderer,
  SVGImageRenderer,
  TableRender,
} from "./default_data_view_renderer";

export const DataViewRendererToDataPreviewViewRenderer = (
  DV: latest.DataViewRendererType,
  defaultValue: any = undefined
): latest.DataPreviewViewRendererType => {
  return ({ iostore }: latest.DataPreviewViewRendererProps) => {
    const { full, preview } = iostore.valuestore();
    const val = full === undefined ? preview : full;
    const renderval = val?.value || defaultValue;

    return <DV iostore={iostore} value={renderval} />;
  };
};

export const DefaultDataPreviewViewRenderer: {
  [key: string]: latest.DataPreviewViewRendererType | undefined;
} = {
  string: DataViewRendererToDataPreviewViewRenderer(StringValueRenderer),
  str: DataViewRendererToDataPreviewViewRenderer(StringValueRenderer),
  table: DataViewRendererToDataPreviewViewRenderer(TableRender),
  image: DataViewRendererToDataPreviewViewRenderer(DefaultImageRenderer),
  svg: DataViewRendererToDataPreviewViewRenderer(SVGImageRenderer, ""),
  dict: DataViewRendererToDataPreviewViewRenderer(DictRenderer, "{}"),
  bytes: DataViewRendererToDataPreviewViewRenderer(Base64BytesRenderer, ""),
};
