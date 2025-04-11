import * as React from "react";

import JSONDataDisplay from "../utils/jsondata";
import { SortableTable } from "../utils/table";
import { SVGImage, StreamingImage } from "./images";
import { latest } from "../../types/versioned/versions.t";

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

  return <img src={src} style={{ maxWidth: "100%", maxHeight: "100%" }} />;
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

const TableRender: latest.DataViewRendererType = ({
  value,
}: latest.DataViewRendererProps) => {
  return (
    <SortableTable
      tabledata={
        value || {
          columns: [],
          index: [],
          data: [],
        }
      }
    />
  );
};

const DictRenderer: latest.DataViewRendererType = ({
  value,
}: latest.DataViewRendererProps) => {
  return <JSONDataDisplay data={value} />;
};

export const DefaultDataView = DictRenderer;

export const DefaultDataViewRenderer: {
  [key: string]: latest.DataViewRendererType | undefined;
} = {
  string: SingleValueRenderer,
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
};
