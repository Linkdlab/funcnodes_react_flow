import * as React from "react";
import {
  Base64ImageRenderer,
  StreamingImage,
  SVGImage,
} from "@/shared-components";
import { DataViewRendererProps, DataViewRendererType } from "./types";

export const SVGImageRenderer: DataViewRendererType = React.memo(
  ({ value }: DataViewRendererProps) => {
    if (typeof value !== "string") return <div>Invalid SVG</div>;
    return <SVGImage value={value} />;
  }
);

export const DefaultImageRenderer: DataViewRendererType = ({
  value,
  preValue,
  onLoaded,
}: DataViewRendererProps) => {
  const [src, setSrc] = React.useState<string | undefined>(
    preValue?.toString() || value?.toString()
  );

  React.useEffect(() => {
    // If the value is the same as what we’re already displaying, do nothing.
    if (value === preValue) return;
    if (value === undefined || value === null) return;

    const tempImage = new Image();
    const valuestring = value.toString();
    tempImage.onload = () => {
      // Update the visible image only after the new image has loaded
      onLoaded?.();
      setSrc(valuestring);
    };
    tempImage.src = valuestring;

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

  if (!isblob) {
    return <Base64ImageRenderer value={src} format="jpeg" />;
  }

  return <StreamingImage src={src} />;
};
