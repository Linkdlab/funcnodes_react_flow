import * as React from "react";
import { JSX } from "react";
import { RenderType } from "../../types/rendering.t";
import {
  Base64ImageRenderer,
  ImageRenderOptions,
  SVGImageRenderer,
} from "./images";

interface BaseRenderOptions {
  type?: RenderType;
}

interface StringRenderOptions extends BaseRenderOptions {
  max_length?: number;
}
type RenderOptions =
  | BaseRenderOptions
  | ImageRenderOptions
  | StringRenderOptions;

const StringRenderer = ({
  value,
  renderoptions,
}: {
  value: any;
  renderoptions?: StringRenderOptions;
}) => {
  let string = JSON.stringify(value, null, 2);
  const max_length = renderoptions?.max_length || 1000;
  // shorten string if too long
  if (string.length > max_length) {
    string = string.substring(0, max_length) + "...";
  }

  return <>{string}</>;
};
const RENDERTYPES: {
  [key: string]: ({
    value,
    renderoptions,
  }: {
    value: any;
    renderoptions?: RenderOptions;
  }) => JSX.Element;
} = {
  image: Base64ImageRenderer,
  string: StringRenderer,
  str: StringRenderer,
  svg: SVGImageRenderer,
};
const get_rendertype = (rendertype: string) => {
  const rt = RENDERTYPES[rendertype];
  if (rt === undefined) return RENDERTYPES["string"];
  return rt;
};

export default get_rendertype;
export type { RenderOptions, BaseRenderOptions };
