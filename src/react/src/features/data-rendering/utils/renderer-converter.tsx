import * as React from "react";
import {
  DataOverlayRendererProps,
  DataOverlayRendererType,
  DataPreviewViewRendererProps,
  DataPreviewViewRendererType,
  DataViewRendererType,
  HandlePreviewRendererProps,
  HandlePreviewRendererType,
  InputRendererProps,
  InputRendererType,
} from "@/data-rendering-types";

export const DataViewRendererToOverlayRenderer = (
  DV: DataViewRendererType
): DataOverlayRendererType => {
  return ({ iostore, value, preValue, onLoaded }: DataOverlayRendererProps) => {
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

export const DataViewRendererToDataPreviewViewRenderer = (
  DV: DataViewRendererType,
  defaultValue: any = undefined,
  props: any = {}
): DataPreviewViewRendererType => {
  return ({ iostore }: DataPreviewViewRendererProps) => {
    const { full, preview } = iostore.valuestore();
    const val = full === undefined ? preview : full;
    const renderval = val?.value || defaultValue;

    return <DV iostore={iostore} value={renderval} {...props} />;
  };
};

export const DataPreviewViewRendererToHandlePreviewRenderer = (
  DPR: DataPreviewViewRendererType
): HandlePreviewRendererType => {
  return ({ iostore }: HandlePreviewRendererProps) => {
    return <DPR iostore={iostore} />;
  };
};

export const DataViewRendererToInputRenderer = (
  DV: DataViewRendererType,
  defaultValue: any = undefined
): InputRendererType => {
  return ({ iostore }: InputRendererProps) => {
    const { full, preview } = iostore.valuestore();
    const val = full === undefined ? preview : full;
    const renderval = val?.value || defaultValue;

    return <DV iostore={iostore} value={renderval} />;
  };
};
