import React from "react";
import { BaseRenderOptions } from ".";
interface ImageRenderOptions extends BaseRenderOptions {
  format?: "png" | "jpeg";
}

const Base64ImageRenderer = ({
  value,
  renderoptions,
}: {
  value: string;
  renderoptions?: ImageRenderOptions;
}) => {
  if (renderoptions === undefined) renderoptions = {};
  if (renderoptions.format === undefined) renderoptions.format = "jpeg";

  return (
    <img
      src={"data:image/" + renderoptions.format + ";base64," + value}
      style={{
        maxWidth: "100%",
        maxHeight: "100%",
      }}
    />
  );
};

export { Base64ImageRenderer };
export type { ImageRenderOptions };
