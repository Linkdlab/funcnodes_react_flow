import { OutputRendererType } from "./types";

import * as React from "react";
import { useIOStore } from "@/nodes";
import { stringifyValue } from "../data-view-renderer/json";

export const InLineOutput = () => {
  const iostore = useIOStore();
  const { preview, full } = iostore.valuestore();
  const src = full || preview;
  let disp = stringifyValue(src);

  //truncate the string if it is too long
  if (disp.length > 63) {
    disp = disp.slice(0, 60) + "...";
  }

  return <div>{disp}</div>;
};

export const DefaultOutputRenderer: {
  [key: string]: OutputRendererType | undefined;
} = {};

export const FallbackOutputRenderer: OutputRendererType = InLineOutput;
