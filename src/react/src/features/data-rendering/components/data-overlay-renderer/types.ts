import { JSX } from "react";

export interface DataOverlayRendererProps {
  value: any;
  preValue?: any;
  onLoaded?: () => void;
}

type BasicDataOverlayRendererType = (
  props: DataOverlayRendererProps
) => JSX.Element;
export type DataOverlayRendererType =
  | BasicDataOverlayRendererType
  | React.MemoExoticComponent<BasicDataOverlayRendererType>;
