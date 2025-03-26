import { latest } from "../../types/versioned/versions.t";
import * as React from "react";
import { DictRenderer } from "./default_data_view_renderer";

export const DataViewRendererToOverlayRenderer = (
  DV: latest.DataViewRendererType
): latest.DataOverlayRendererType => {
  return ({
    iostore,
    value,
    preValue,
    onLoaded,
  }: latest.DataOverlayRendererProps) => {
    return (
      <DV
        iostore={iostore}
        value={value}
        preValue={preValue}
        onLoaded={onLoaded}
      />
    );
  };
};
export const DefaultOverlayRenderer: latest.DataOverlayRendererType =
  DataViewRendererToOverlayRenderer(DictRenderer);

export const DefaultDataOverlayViews: {
  [key: string]: latest.DataOverlayRendererType | undefined;
} = {
  // image: Base64FullImageOutput,
};
