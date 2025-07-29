import { OutputRendererType } from "./types";

import * as React from "react";
import { latest } from "@/barrel_imports";

export const InLineOutput = ({ iostore }: { iostore: latest.IOStore }) => {
  const { preview, full } = iostore.valuestore();

  let disp = (JSON.stringify(full || preview) || "").replace(/\\n/g, "\n");

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
