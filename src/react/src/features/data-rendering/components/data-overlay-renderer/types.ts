import { latest } from "@/barrel_imports";
import { JSX } from "react";

export interface DataOverlayRendererProps {
  iostore: latest.IOStore;
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
