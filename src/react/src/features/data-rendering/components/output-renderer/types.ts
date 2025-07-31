import { IOStore } from "@/nodes-core";
import { JSX } from "react";

export type OutputRendererProps = {
  iostore: IOStore;
};

type BasicOutputRendererType = (props: OutputRendererProps) => JSX.Element;
export type OutputRendererType =
  | BasicOutputRendererType
  | React.MemoExoticComponent<BasicOutputRendererType>;
