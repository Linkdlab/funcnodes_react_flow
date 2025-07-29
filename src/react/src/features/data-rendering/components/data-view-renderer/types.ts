import { JSX } from "react";
import { latest } from "@/barrel_imports";
import { JSONType } from "src/shared/data-structures/data-structures";

export type DataViewRendererProps = {
  iostore: latest.IOStore;
  value: JSONType | undefined;
  preValue?: JSONType | undefined;
  onLoaded?: () => void;
};
type BasicDataViewRendererType = (props: DataViewRendererProps) => JSX.Element;
export type DataViewRendererType =
  | BasicDataViewRendererType
  | React.MemoExoticComponent<BasicDataViewRendererType>;
