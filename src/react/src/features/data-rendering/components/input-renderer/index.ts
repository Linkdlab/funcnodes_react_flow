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

export { DefaultInputRenderer } from "./default";
export { BooleanInput } from "./boolean";
export { StringInput } from "./text";
export { ColorInput } from "./color";
export { FloatInput, IntegerInput, NumberInput } from "./numbers";
export { SelectionInput } from "./selection";
