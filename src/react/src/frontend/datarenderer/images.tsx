import * as React from "react";
import { ReactSVG } from "react-svg";
import { latest } from "../../types/versioned/versions.t";
import { ArrayBufferDataStructure } from "../../funcnodes/datastructures";

const Base64ImageRenderer = ({
  value,
  renderoptions,
}: {
  value: string | ArrayBufferDataStructure;
  renderoptions?: latest.ImageRenderOptions;
}) => {
  const format = renderoptions?.format || "jpeg";
  return (
    <img
      src={"data:image/" + format + ";base64, " + value}
      style={{
        maxWidth: "100%",
        maxHeight: "100%",
      }}
    />
  );
};

function StreamingImage({
  src,
  style,
}: {
  src: string;
  style: React.CSSProperties;
}) {
  const imgRef = React.useRef<HTMLImageElement | null>(null);

  React.useEffect(() => {
    if (imgRef.current) {
      imgRef.current.src = src;
    }
    // empty dependency array ensures this runs only once
  }, [src]);

  return <img ref={imgRef} style={style} alt="streamed" />;
}

export default StreamingImage;

export const Base64FullImageOutput = ({
  iostore,
}: {
  iostore: latest.IOStore;
}) => {
  const { full } = iostore.valuestore();
  const [disp, setDisp] = React.useState<string>(full?.value || "");
  React.useEffect(() => {
    if (full !== undefined) {
      setDisp(full.value);
    } else {
      iostore.getState().try_get_full_value();
    }
  }, [full]);
  return <Base64ImageRenderer value={disp} />;
};

const SVGImage = ({ value }: { value: string }) => {
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

export { Base64ImageRenderer, SVGImage, StreamingImage };
