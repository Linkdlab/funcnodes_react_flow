import { Base64BytesRenderer } from "./bytes";
import { DefaultImageRenderer, SVGImageRenderer } from "./images";
import { DictRenderer } from "./json";
import { TableRender } from "./tables";
import { StringValueRenderer } from "./text";
import { DataViewRendererType } from "./types";

export const FallbackDataViewRenderer = DictRenderer;

export const DefaultDataViewRenderer: {
  [key: string]: DataViewRendererType | undefined;
} = {
  string: StringValueRenderer,
  str: StringValueRenderer,
  table: TableRender,
  image: DefaultImageRenderer,
  svg: SVGImageRenderer,
  dict: DictRenderer,
  bytes: Base64BytesRenderer,
};
