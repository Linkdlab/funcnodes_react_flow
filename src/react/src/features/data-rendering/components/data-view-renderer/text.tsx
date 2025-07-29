import * as React from "react";
import { DataViewRendererProps, DataViewRendererType } from ".";
import { SingleValueRenderer } from "./json";

export const StringValueRenderer: DataViewRendererType = (
  props: DataViewRendererProps
) => {
  return <SingleValueRenderer {...props} />; // Otherwise, render as plain text
};
