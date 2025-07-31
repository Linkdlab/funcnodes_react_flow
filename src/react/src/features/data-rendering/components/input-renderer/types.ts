import { IOStore } from "@/nodes-core";
import { JSX } from "react";

export type InputRendererProps = {
  iostore: IOStore;
  inputconverter: [(v: any) => any, (v: any) => any];
};

type BasicInputRendererType = (props: InputRendererProps) => JSX.Element;
export type InputRendererType =
  | BasicInputRendererType
  | React.MemoExoticComponent<BasicInputRendererType>;
