import React from "react";
import { ReactSVG } from "react-svg";
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
      src={"data:image/" + renderoptions.format + ";base64, " + value}
      style={{
        maxWidth: "100%",
        maxHeight: "100%",
      }}
    />
  );
};

const SVGImageRenderer = ({ value }: { value: string }) => {
  return (
    <ReactSVG
      src={`data:image/svg+xml;base64,${btoa(value)}`}
      style={{
        maxWidth: "100%",
        maxHeight: "100%",
      }}
      beforeInjection={(svg) => {
        // Add a class name to the SVG element. Note: You'll need a classList
        // polyfill if you're using this in older browsers.
        svg.classList.add("svg-class-name");

        // Add inline style to the SVG element.
        svg.setAttribute("style", "max-width: 100%; max-height: 100%;");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
      }}
    />
  );
};

export { Base64ImageRenderer, SVGImageRenderer };
export type { ImageRenderOptions };
