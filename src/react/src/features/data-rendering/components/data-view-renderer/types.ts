import { JSX } from "react";
import { IOStore } from "@/nodes-core";
import { JSONType } from "@/data-structures";

export type DataViewRendererProps = {
  iostore: IOStore;
  value: JSONType | undefined;
  preValue?: JSONType | undefined;
  onLoaded?: () => void;
};
type BasicDataViewRendererType = (props: DataViewRendererProps) => JSX.Element;
export type DataViewRendererType =
  | BasicDataViewRendererType
  | React.MemoExoticComponent<BasicDataViewRendererType>;
