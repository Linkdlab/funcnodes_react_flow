import { JSX } from "react";

export type OutputRendererProps = {};

type BasicOutputRendererType = (props: OutputRendererProps) => JSX.Element;
export type OutputRendererType =
  | BasicOutputRendererType
  | React.MemoExoticComponent<BasicOutputRendererType>;
