import { JSX } from "react";

export type InputRendererProps = {
  inputconverter: [(v: any) => any, (v: any) => any];
};

type BasicInputRendererType = (props: InputRendererProps) => JSX.Element;
export type InputRendererType =
  | BasicInputRendererType
  | React.MemoExoticComponent<BasicInputRendererType>;
