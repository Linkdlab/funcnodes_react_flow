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

export { DefaultDataViewRenderer, FallbackDataViewRenderer } from "./defaults";
export { Base64BytesRenderer } from "./bytes";
export { DictRenderer } from "./json";
export { StringValueRenderer } from "./text";
export { TableRender } from "./tables";
export { DefaultImageRenderer, SVGImageRenderer } from "./images";
