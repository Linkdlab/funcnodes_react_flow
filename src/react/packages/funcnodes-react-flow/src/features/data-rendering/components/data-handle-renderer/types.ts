import { IOStore } from "@/nodes-core";
import { JSX } from "react";

export type HandlePreviewRendererProps = {
  iostore: IOStore;
};

type BasicHandlePreviewRendererType = (
  props: HandlePreviewRendererProps
) => JSX.Element;
export type HandlePreviewRendererType =
  | BasicHandlePreviewRendererType
  | React.MemoExoticComponent<BasicHandlePreviewRendererType>;
