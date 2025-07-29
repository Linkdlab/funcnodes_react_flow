import { latest } from "@/barrel_imports";
import { JSX } from "react";

export type DataPreviewViewRendererProps = {
  iostore: latest.IOStore;
};

type BasicDataPreviewViewRendererType = (
  props: DataPreviewViewRendererProps
) => JSX.Element;
export type DataPreviewViewRendererType =
  | BasicDataPreviewViewRendererType
  | React.MemoExoticComponent<BasicDataPreviewViewRendererType>;

export {
  DefaultDataPreviewViewRenderer,
  FallbackDataPreviewViewRenderer,
} from "./default";
