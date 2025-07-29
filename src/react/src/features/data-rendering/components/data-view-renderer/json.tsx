import * as React from "react";
import { DataViewRendererProps, DataViewRendererType } from "./types";
import { JSONDisplay } from "@/shared-components";

export const SingleValueRenderer: DataViewRendererType = React.memo(
  ({ value }: DataViewRendererProps) => {
    let disp = "";
    try {
      disp = JSON.stringify(value);
    } catch (e) {}

    return (
      <div>
        <pre>{disp}</pre>
      </div>
    );
  }
);

export const DictRenderer: DataViewRendererType = ({
  value,
}: DataViewRendererProps) => {
  return <JSONDisplay data={value} />;
};
