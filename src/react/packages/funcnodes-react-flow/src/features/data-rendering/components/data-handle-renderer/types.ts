import { JSX } from "react";

export type HandlePreviewRendererProps = {};

type BasicHandlePreviewRendererType = (
  props: HandlePreviewRendererProps
) => JSX.Element;
export type HandlePreviewRendererType =
  | BasicHandlePreviewRendererType
  | React.MemoExoticComponent<BasicHandlePreviewRendererType>;
