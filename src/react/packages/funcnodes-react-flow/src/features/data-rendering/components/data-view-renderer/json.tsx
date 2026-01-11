import * as React from "react";
import { DataViewRendererProps, DataViewRendererType } from "./types";
import { JSONDisplay } from "@/shared-components";

export const stringifyValue = (value: any): string => {
  let disp = "";
  if (typeof value === "string") {
    disp = value;
  } else if (typeof value === "number" || typeof value === "boolean") {
    disp = String(value);
  } else if (value === null) {
    disp = "null";
  } else if (value === undefined) {
    disp = String(value ?? "undefined");
  } else {
    try {
      disp = JSON.stringify(value);
    } catch (e) {}
  }
  return disp;
};

export const SingleValueRenderer: DataViewRendererType = React.memo(
  ({ value }: DataViewRendererProps) => {
    return (
      <div>
        <pre>{stringifyValue(value)}</pre>
      </div>
    );
  }
);

export const DictRenderer: DataViewRendererType = ({
  value,
}: DataViewRendererProps) => {
  return <JSONDisplay data={value} />;
};
