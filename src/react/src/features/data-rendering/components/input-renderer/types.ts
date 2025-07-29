import { latest } from "@/barrel_imports";
import { JSX } from "react";

export type InputRendererProps = {
  iostore: latest.IOStore;
  inputconverter: [(v: any) => any, (v: any) => any];
};

type BasicInputRendererType = (props: InputRendererProps) => JSX.Element;
export type InputRendererType =
  | BasicInputRendererType
  | React.MemoExoticComponent<BasicInputRendererType>;
