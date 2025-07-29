import { latest } from "@/barrel_imports";
import { JSX } from "react";

export type HandlePreviewRendererProps = {
  iostore: latest.IOStore;
};

type BasicHandlePreviewRendererType = (
  props: HandlePreviewRendererProps
) => JSX.Element;
export type HandlePreviewRendererType =
  | BasicHandlePreviewRendererType
  | React.MemoExoticComponent<BasicHandlePreviewRendererType>;
