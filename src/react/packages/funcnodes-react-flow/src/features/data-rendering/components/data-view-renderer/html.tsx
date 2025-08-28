import * as React from "react";
import { DataViewRendererProps, DataViewRendererType } from "./types";

export const HTMLRenderer: DataViewRendererType = ({
  value,
}: DataViewRendererProps) => {
  if (typeof value !== "string") return <div>Invalid HTML</div>;

  return (
    <iframe
      title="html-preview"
      srcDoc={value}
      sandbox="allow-scripts"
      style={{
        border: "none",
        width: "100%",
        height: "100vh",
      }}
    />
  );
};
