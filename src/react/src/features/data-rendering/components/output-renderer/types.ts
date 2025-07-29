import { latest } from "@/barrel_imports";
import { JSX } from "react";

export type OutputRendererProps = {
  iostore: latest.IOStore;
};

type BasicOutputRendererType = (props: OutputRendererProps) => JSX.Element;
export type OutputRendererType =
  | BasicOutputRendererType
  | React.MemoExoticComponent<BasicOutputRendererType>;
