import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ArrayBufferDataStructure } from "@/data-structures";
import {
  Base64ImageRenderer,
  SVGImage,
  StreamingImage,
} from "./images";

describe("Base64ImageRenderer", () => {
  it("shows placeholder when no base64 value is provided", () => {
    render(<Base64ImageRenderer value="" />);

    expect(screen.getByText("No image data provided")).toBeInTheDocument();
  });

  it("renders a base64 image and updates loading state on load", async () => {
    const onLoad = vi.fn();
    render(
      <Base64ImageRenderer
        value="Zm9v"
        format="png"
        alt="base64"
        onLoad={onLoad}
      />
    );

    const img = screen.getByAltText("base64");
    expect(img).toHaveAttribute("src", "data:image/png;base64,Zm9v");
    expect(img).toHaveClass("loading");

    fireEvent.load(img);

    await waitFor(() => {
      expect(onLoad).toHaveBeenCalledTimes(1);
      expect(screen.getByAltText("base64")).not.toHaveClass("loading");
    });
  });

  it("converts ArrayBufferDataStructure values to base64", () => {
    const buffer = new Uint8Array([72, 105]).buffer; // "Hi"
    const value = new ArrayBufferDataStructure({
      data: buffer,
      mime: "image/jpeg",
    });

    render(<Base64ImageRenderer value={value} alt="buffer" />);

    const img = screen.getByAltText("buffer");
    expect(img).toHaveAttribute(
      "src",
      `data:image/jpeg;base64,${btoa("Hi")}`
    );
  });

  it("shows an error placeholder when the image fails to load", async () => {
    const onError = vi.fn();
    render(<Base64ImageRenderer value="Zm9v" onError={onError} />);

    const img = screen.getByAltText("Base64 image");
    fireEvent.error(img);

    expect(await screen.findByText("Failed to load base64 image")).toBeInTheDocument();
    expect(onError).toHaveBeenCalledTimes(1);
  });
});

describe("SVGImage", () => {
  it("shows placeholder when svg value is empty", () => {
    render(<SVGImage value="" />);

    expect(screen.getByText("No image data provided")).toBeInTheDocument();
  });

  it("shows error placeholder when svg encoding fails", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<SVGImage value="😀" />);

    expect(screen.getByText("Failed to load SVG")).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it("renders svg wrapper for valid svg input", () => {
    const svg = "<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>";
    render(<SVGImage value={svg} alt="inline" />);

    expect(document.querySelector(".svg-renderer")).toBeInTheDocument();
  });
});

describe("StreamingImage", () => {
  it("renders a streaming image and updates loading state on load", async () => {
    const onLoad = vi.fn();
    render(
      <StreamingImage
        src="http://example.com/stream.png"
        alt="stream"
        onLoad={onLoad}
      />
    );

    const img = screen.getByAltText("stream");
    expect(img).toHaveClass("loading");

    await waitFor(() => {
      expect(img.getAttribute("src")).toBe("http://example.com/stream.png");
    });

    fireEvent.load(img);

    await waitFor(() => {
      expect(onLoad).toHaveBeenCalledTimes(1);
      expect(screen.getByAltText("stream")).not.toHaveClass("loading");
    });
  });

  it("shows placeholder when streaming image errors", async () => {
    const onError = vi.fn();
    render(<StreamingImage src="http://example.com/bad.png" onError={onError} />);

    const img = screen.getByAltText("Streaming image");
    fireEvent.error(img);

    expect(await screen.findByText("Failed to load image")).toBeInTheDocument();
    expect(onError).toHaveBeenCalledTimes(1);
  });
});
