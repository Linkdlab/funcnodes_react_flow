import * as React from "react";
import { ArrayBufferDataStructure } from "@/data-structures";
import { ReactSVG } from "react-svg";

const ImagePlaceholder = ({
  text = "No image data provided",
}: {
  text?: string;
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100px",
        border: "1px dashed #ccc",
        color: "#666",
      }}
    >
      {text}
    </div>
  );
};

export const Base64ImageRenderer = React.memo(
  ({
    value,
    format = "jpeg",
    alt = "Base64 image",
    onError,
    onLoad,
    ...props
  }: {
    value: string | ArrayBufferDataStructure;
    format?: string;
    alt?: string;
    onError?: (error: Event) => void;
    onLoad?: () => void;
  } & React.ImgHTMLAttributes<HTMLImageElement>) => {
    const [hasError, setHasError] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const imgRef = React.useRef<HTMLImageElement | null>(null);

    // Convert ArrayBuffer to base64 string if needed
    const base64Value = React.useMemo(() => {
      if (typeof value === "string") {
        return value;
      }
      // Handle ArrayBufferDataStructure
      if (value && typeof value === "object" && "data" in value) {
        const arrayBuffer = value.data;
        if (arrayBuffer instanceof ArrayBuffer) {
          const bytes = new Uint8Array(arrayBuffer);
          let binary = "";
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          return btoa(binary);
        }
      }
      return "";
    }, [value]);

    const src = React.useMemo(() => {
      if (!base64Value) return "";
      return `data:image/${format};base64,${base64Value}`;
    }, [base64Value, format]);

    const handleError = React.useCallback(
      (error: Event) => {
        setHasError(true);
        setIsLoading(false);
        onError?.(error);
      },
      [onError]
    );

    const handleLoad = React.useCallback(() => {
      setIsLoading(false);
      setHasError(false);
      onLoad?.();
    }, [onLoad]);

    // Add event listeners when component mounts
    React.useEffect(() => {
      const img = imgRef.current;
      if (!img) return;
      img.addEventListener("error", handleError);
      img.addEventListener("load", handleLoad);

      return () => {
        img.removeEventListener("error", handleError);
        img.removeEventListener("load", handleLoad);
      };
    }, [handleError, handleLoad, value]);

    // Reset states when value changes
    React.useEffect(() => {
      setHasError(false);
      setIsLoading(true);
    }, [value]);

    if (!base64Value) {
      return <ImagePlaceholder />;
    }

    if (hasError) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100px",
            border: "1px dashed #ccc",
            color: "#666",
          }}
        >
          Failed to load base64 image
        </div>
      );
    }

    return (
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`base64-image-renderer image-renderer ${
          props.className || ""
        } ${isLoading ? " loading" : ""}`}
        {...props}
      />
    );
  }
);

export const SVGImage = React.memo(
  ({
    value,
    alt = "SVG image",
    onError,
    onLoad,
    ...props
  }: {
    value: string;
    alt?: string;
    onError?: (error: Event) => void;
    onLoad?: () => void;
  } & Omit<React.ComponentProps<typeof ReactSVG>, "src">) => {
    const [hasError, setHasError] = React.useState(false);

    const svgSrc = React.useMemo(() => {
      if (!value) return "";
      try {
        return `data:image/svg+xml;base64,${btoa(value)}`;
      } catch (error) {
        console.error("Failed to encode SVG to base64:", error);
        return "";
      }
    }, [value]);

    // Reset states when value changes
    React.useEffect(() => {
      setHasError(false);
    }, [value]);

    const handleError = React.useCallback(
      (error: unknown) => {
        setHasError(true);
        onError?.(error as Event);
      },
      [onError]
    );

    if (!value) {
      return <ImagePlaceholder />;
    }

    if (hasError || !svgSrc) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100px",
            border: "1px dashed #ccc",
            color: "#666",
          }}
        >
          Failed to load SVG
        </div>
      );
    }

    return (
      <ReactSVG
        src={svgSrc}
        className={`svg-renderer ${props.className || ""}`}
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          ...props.style,
        }}
        beforeInjection={(svg) => {
          svg.classList.add("svg-renderer");
          svg.setAttribute("style", "max-width: 100%; max-height: 100%;");
          svg.setAttribute("width", "100%");
          svg.setAttribute("height", "100%");
          svg.setAttribute("aria-label", alt);

          // Add load event listener to the SVG
          const handleSvgLoad = () => {
            setHasError(false);
            onLoad?.();
          };

          const handleSvgError = (error: Event) => {
            setHasError(true);
            onError?.(error);
          };

          // Try to add event listeners to the SVG element
          try {
            svg.addEventListener("load", handleSvgLoad);
            svg.addEventListener("error", handleSvgError);
          } catch (e) {
            // Fallback: trigger load immediately if we can't add listeners
            handleSvgLoad();
          }

          return undefined;
        }}
        onError={handleError}
      />
    );
  }
);

export const StreamingImage = React.memo(
  ({
    src,
    alt = "Streaming image",
    onError,
    onLoad,
    ...props
  }: {
    src: string;
    alt?: string;
    onError?: (error: Event) => void;
    onLoad?: () => void;
  } & React.ImgHTMLAttributes<HTMLImageElement>) => {
    const imgRef = React.useRef<HTMLImageElement | null>(null);
    const [hasError, setHasError] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
      if (imgRef.current && src) {
        setIsLoading(true);
        setHasError(false);
        imgRef.current.src = src;
      }
    }, [src]);

    const handleError = React.useCallback(
      (error: Event) => {
        setHasError(true);
        setIsLoading(false);
        onError?.(error);
      },
      [onError]
    );

    const handleLoad = React.useCallback(() => {
      setIsLoading(false);
      setHasError(false);
      onLoad?.();
    }, [onLoad]);

    // Add event listeners when component mounts
    React.useEffect(() => {
      const img = imgRef.current;
      if (!img) return;
      img.addEventListener("error", handleError);
      img.addEventListener("load", handleLoad);

      return () => {
        img.removeEventListener("error", handleError);
        img.removeEventListener("load", handleLoad);
      };
    }, [handleError, handleLoad]);

    if (hasError) {
      return <ImagePlaceholder text="Failed to load image" />;
    }

    return (
      <img
        ref={imgRef}
        className={`streaming-image image-renderer ${props.className || ""} ${
          isLoading ? " loading" : ""
        }`}
        alt={alt}
        {...props}
      />
    );
  }
);
