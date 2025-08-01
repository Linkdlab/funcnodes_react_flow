import * as React from "react";
import { DataViewRendererProps, DataViewRendererType } from "./types";

export const Base64BytesRenderer: DataViewRendererType = React.memo(
  ({ value }: DataViewRendererProps) => {
    // chack if the value is a base64 string
    const valuestring = value?.toString() ?? "";
    const length = Math.round((3 * valuestring.length) / 4); // 3/4 is the ratio of base64 encoding
    return (
      <div>
        <pre>Bytes({length})</pre>
      </div>
    );
  }
);
