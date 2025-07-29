import * as React from "react";
import { SortableTable } from "@/shared-components";
import { DataViewRendererProps, DataViewRendererType } from "./types";

export const TableRender: DataViewRendererType = React.memo(
  ({ value }: DataViewRendererProps) => {
    if (typeof value !== "object" || value == null)
      return <div>Invalid Table</div>;
    if (!("columns" in value && "index" in value && "data" in value))
      return <div>Invalid Table</div>;
    if (
      !Array.isArray(value.columns) ||
      !Array.isArray(value.index) ||
      !Array.isArray(value.data) ||
      !value.data.every((row) => Array.isArray(row))
    )
      return <div>Invalid Table</div>;

    const table_data = {
      columns: (value.columns as string[]) || [],
      index: (value.index as string[]) || [],
      data: value.data || [],
    };
    return <SortableTable tabledata={table_data} />;
  }
);
