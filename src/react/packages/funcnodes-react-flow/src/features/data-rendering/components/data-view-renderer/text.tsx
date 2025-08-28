import * as React from "react";
import { DataViewRendererProps, DataViewRendererType } from "./types";
import { SingleValueRenderer } from "./json";

export const StringValueRenderer: DataViewRendererType = (
  props: DataViewRendererProps
) => {
  return <SingleValueRenderer {...props} />; // Otherwise, render as plain text
};
