import * as React from "react";
import type { DataViewRendererProps, DataViewRendererType } from "./types";
import { JSONDisplay } from "@/shared-components";
import { stringifyValue } from "@/data-helpers";

export const SingleValueRenderer: DataViewRendererType = React.memo(
  ({ value }: DataViewRendererProps) => {
    return (
      <div>
        <pre>{stringifyValue(value) ?? ""}</pre>
      </div>
    );
  },
);

export const DictRenderer: DataViewRendererType = ({
  value,
}: DataViewRendererProps) => {
  return <JSONDisplay data={value} />;
};
