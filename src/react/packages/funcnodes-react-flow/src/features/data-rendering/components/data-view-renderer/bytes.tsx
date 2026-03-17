import * as React from "react";
import type { DataViewRendererProps, DataViewRendererType } from "./types";
import { getBase64ByteLength } from "@/data-helpers";

export const Base64BytesRenderer: DataViewRendererType = React.memo(
  ({ value }: DataViewRendererProps) => {
    const length = getBase64ByteLength(value);
    return (
      <div>
        <pre>Bytes({length})</pre>
      </div>
    );
  }
);
