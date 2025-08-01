import { IOStore } from "@/nodes-core";
import { JSX } from "react";

export type DataPreviewViewRendererProps = {
  iostore: IOStore;
};

type BasicDataPreviewViewRendererType = (
  props: DataPreviewViewRendererProps
) => JSX.Element;
export type DataPreviewViewRendererType =
  | BasicDataPreviewViewRendererType
  | React.MemoExoticComponent<BasicDataPreviewViewRendererType>;
