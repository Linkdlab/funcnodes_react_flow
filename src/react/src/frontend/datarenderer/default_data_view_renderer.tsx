import * as React from "react";

import { JSONDisplay } from "@/shared-components";
import { SortableTable } from "@/shared-components";
import { SVGImage, StreamingImage } from "./images";
import { latest } from "@/barrel_imports";

const IOSubscriptionImageRenderer: latest.DataViewRendererType = ({
  value,
}: latest.DataViewRendererProps) => {
  return (
    <StreamingImage
      src={value}
      style={{
        maxWidth: "100%",
        maxHeight: "100%",
        minWidth: "6.25rem",
        minHeight: "6.25rem",
      }}
    ></StreamingImage>
  );
};

const DefaultImageRenderer: latest.DataViewRendererType = ({
  value,
  preValue,
  onLoaded,
}: latest.DataViewRendererProps) => {
  const [src, setSrc] = React.useState<string>(preValue || value);

  React.useEffect(() => {
    // If the value is the same as what we’re already displaying, do nothing.
    if (value === preValue) return;

    const tempImage = new Image();
    tempImage.onload = () => {
      // Update the visible image only after the new image has loaded
      onLoaded?.();
      setSrc(value);
    };
    tempImage.src = value;

    // Cleanup handler in case the value changes again before load
    return () => {
      tempImage.onload = null;
    };
  }, [value, preValue, onLoaded]);

  if (src === undefined) {
    return <></>;
  }

  if (typeof src !== "string") {
    console.error("ImageRenderer: value is not a string", src);
    return <></>;
  }

  // Check if the value is a valid image URL or base64 string
  const isblob = src.startsWith("data:") || src.startsWith("blob:");

  let valid_src = src;
  if (!isblob) {
    // If the value is not a valid image URL or base64 string we assume its a raw base64 string
    // and convert it to a blob URL
    valid_src = "data:image/jpeg;base64," + src;
  }

  return (
    <img src={valid_src} style={{ maxWidth: "100%", maxHeight: "100%" }} />
  );
};

const SVGImageRenderer: latest.DataViewRendererType = ({
  value,
}: latest.DataViewRendererProps) => {
  return <SVGImage value={value} />;
};

const SingleValueRenderer: latest.DataViewRendererType = ({
  value,
}: latest.DataViewRendererProps) => {
  let disp = "";
  try {
    disp = JSON.stringify(value);
  } catch (e) {}

  return (
    <div>
      <pre>{disp}</pre>
    </div>
  );
};

const HTMLRenderer: latest.DataViewRendererType = ({
  value,
}: latest.DataViewRendererProps) => {
  /** Save the current srcDoc (`value`) to a file called preview.html */
  const handleDownload = () => {
    const blob = new Blob([value], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "preview.html";
    a.click();

    URL.revokeObjectURL(url); // tidy up
  };

  return (
    <div style={{ position: "relative" }}>
      {/* small download button, absolute-positioned in the corner */}
      <button
        onClick={handleDownload}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 10,
          padding: "4px 8px",
          fontSize: "0.8rem",
          border: "1px solid #ccc",
          borderRadius: 4,
          background: "#fff",
          cursor: "pointer",
        }}
      >
        Download&nbsp;HTML
      </button>

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
    </div>
  );
};

const StringValueRenderer: latest.DataViewRendererType = (
  props: latest.DataViewRendererProps
) => {
  // const { value } = props;
  // const isHtml = React.useMemo(() => {
  //   if (typeof value !== "string" || !/[<>]/.test(value)) return false;

  //   try {
  //     const doc = new DOMParser().parseFromString(value, "text/html");

  //     // If the parser produced <parsererror>, it’s invalid.
  //     if (doc.querySelector("parsererror")) return false;

  //     // Treat as HTML only if there’s at least one element node.
  //     return Array.from(doc.body.childNodes).some(
  //       (n) => n.nodeType === Node.ELEMENT_NODE
  //     );
  //   } catch {
  //     return false;
  //   }
  // }, [value]);
  // if (isHtml) return HTMLRenderer(props); // Render as HTML if it’s valid HTML
  return SingleValueRenderer(props); // Otherwise, render as plain text
};

const Base64BytesRenderer: latest.DataViewRendererType = ({
  value,
}: latest.DataViewRendererProps) => {
  // chack if the value is a base64 string
  if (typeof value !== "string" || value.length % 4 !== 0)
    return <div>{value}</div>;

  const length = Math.round((3 * value.length) / 4); // 3/4 is the ratio of base64 encoding
  return (
    <div>
      <pre>Bytes({length})</pre>
    </div>
  );
};

// Create a constant empty table to avoid creating new objects on every render
const EMPTY_TABLE_DATA = {
  columns: [],
  index: [],
  data: [],
} as const;

const TableRender: latest.DataViewRendererType = ({
  value,
  ...props
}: latest.DataViewRendererProps) => {
  return <SortableTable tabledata={value || EMPTY_TABLE_DATA} {...props} />;
};

const DictRenderer: latest.DataViewRendererType = ({
  value,
}: latest.DataViewRendererProps) => {
  return <JSONDisplay data={value} />;
};

export const DefaultDataView = DictRenderer;

export const DefaultDataViewRenderer: {
  [key: string]: latest.DataViewRendererType | undefined;
} = {
  string: StringValueRenderer,
  str: StringValueRenderer,
  table: TableRender,
  image: DefaultImageRenderer,
  svg: SVGImageRenderer,
  dict: DictRenderer,
  bytes: Base64BytesRenderer,
};

export {
  DefaultImageRenderer,
  IOSubscriptionImageRenderer,
  SingleValueRenderer,
  TableRender,
  DictRenderer,
  SVGImageRenderer,
  Base64BytesRenderer,
  StringValueRenderer,
  HTMLRenderer,
};
