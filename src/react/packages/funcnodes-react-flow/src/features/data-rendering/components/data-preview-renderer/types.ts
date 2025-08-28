import { JSX } from "react";

export type DataPreviewViewRendererProps = {};

type BasicDataPreviewViewRendererType = (
  props: DataPreviewViewRendererProps
) => JSX.Element;
export type DataPreviewViewRendererType =
  | BasicDataPreviewViewRendererType
  | React.MemoExoticComponent<BasicDataPreviewViewRendererType>;
