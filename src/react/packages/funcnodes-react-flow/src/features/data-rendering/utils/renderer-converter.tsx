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
import { useIOStore } from "@/nodes";

export const DataViewRendererToOverlayRenderer = (
  DV: DataViewRendererType
): DataOverlayRendererType => {
  return ({ value, preValue, onLoaded }: DataOverlayRendererProps) => {
    return <DV value={value} preValue={preValue} onLoaded={onLoaded} />;
  };
};

export const DataViewRendererToDataPreviewViewRenderer = (
  DV: DataViewRendererType,
  defaultValue: any = undefined,
  props: any = {}
): DataPreviewViewRendererType => {
  return ({}: DataPreviewViewRendererProps) => {
    const iostore = useIOStore();
    const { full, preview } = iostore.valuestore();
    const val = full === undefined ? preview : full;
    const renderval = val?.value || defaultValue;

    return <DV value={renderval} {...props} />;
  };
};

export const DataPreviewViewRendererToHandlePreviewRenderer = (
  DPR: DataPreviewViewRendererType
): HandlePreviewRendererType => {
  return ({}: HandlePreviewRendererProps) => {
    return <DPR />;
  };
};

export const DataViewRendererToInputRenderer = (
  DV: DataViewRendererType,
  defaultValue: any = undefined
): InputRendererType => {
  return ({}: InputRendererProps) => {
    const iostore = useIOStore();
    const { full, preview } = iostore.valuestore();
    const val = full === undefined ? preview : full;
    const renderval = val?.value || defaultValue;

    return <DV value={renderval} />;
  };
};
