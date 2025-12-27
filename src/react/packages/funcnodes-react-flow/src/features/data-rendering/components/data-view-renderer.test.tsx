import * as React from "react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import type { JSONType } from "@/data-structures";

import {
  Base64BytesRenderer,
  DefaultImageRenderer,
  SVGImageRenderer,
  TableRender,
} from "./data-view-renderer";
import { HTMLRenderer } from "./data-view-renderer/html";
import { StringValueRenderer } from "./data-view-renderer/text";
import { SingleValueRenderer, DictRenderer } from "./data-view-renderer/json";

const originalImage = global.Image;

beforeEach(() => {
  global.Image = class {
    onload: (() => void) | null = null;
    set src(_value: string) {
      if (this.onload) this.onload();
    }
  } as unknown as typeof Image;
});

afterEach(() => {
  global.Image = originalImage;
});

describe("data view renderers", () => {
  it("renders string values via StringValueRenderer", () => {
    render(<StringValueRenderer value="hello" />);

    expect(screen.getByText("\"hello\"")).toBeInTheDocument();
  });

  it("renders JSON string output in SingleValueRenderer", () => {
    render(<SingleValueRenderer value={{ a: 1 }} />);

    expect(screen.getByText("{\"a\":1}")).toBeInTheDocument();
  });

  it("handles circular data in SingleValueRenderer", () => {
    const circular: Record<string, JSONType> = {};
    circular.self = circular;

    const { container } = render(<SingleValueRenderer value={circular} />);
    const pre = container.querySelector("pre");

    expect(pre?.textContent).toBe("");
  });

  it("renders dictionary values via DictRenderer", () => {
    render(<DictRenderer value={{ a: 1 }} />);

    const container = document.querySelector(".json-display");
    expect(container).toBeInTheDocument();
  });

  it("renders byte length for base64 data", () => {
    render(<Base64BytesRenderer value="AAAA" />);

    expect(screen.getByText("Bytes(3)")).toBeInTheDocument();
  });

  it("renders invalid HTML message for non-string values", () => {
    render(<HTMLRenderer value={123} />);

    expect(screen.getByText("Invalid HTML")).toBeInTheDocument();
  });

  it("renders an iframe for HTML strings", () => {
    render(<HTMLRenderer value="<p>hello</p>" />);

    const iframe = screen.getByTitle("html-preview");
    expect(iframe).toBeInTheDocument();
  });

  it("renders invalid SVG message for non-string values", () => {
    render(<SVGImageRenderer value={42} />);

    expect(screen.getByText("Invalid SVG")).toBeInTheDocument();
  });

  it("renders SVG image for string values", () => {
    render(<SVGImageRenderer value="<svg></svg>" />);

    expect(screen.queryByText("Invalid SVG")).not.toBeInTheDocument();
  });

  it("renders nothing when DefaultImageRenderer has no source", () => {
    const { container } = render(<DefaultImageRenderer value={undefined} />);

    expect(container.innerHTML).toBe("");
  });

  it("renders base64 images via Base64ImageRenderer", async () => {
    render(<DefaultImageRenderer value="AAAA" />);

    await waitFor(() => {
      const img = document.querySelector(".base64-image-renderer");
      expect(img).toBeInTheDocument();
    });
  });

  it("renders streaming images when given data URLs", async () => {
    render(<DefaultImageRenderer value="data:image/png;base64,AAAA" />);

    await waitFor(() => {
      const img = document.querySelector(".streaming-image");
      expect(img).toBeInTheDocument();
    });
  });

  it("renders invalid table for malformed table data", () => {
    render(<TableRender value="not-a-table" />);

    expect(screen.getByText("Invalid Table")).toBeInTheDocument();
  });

  it("renders table data when shape is valid", () => {
    render(
      <TableRender
        value={{
          columns: ["Column"],
          index: ["Row"],
          data: [["Value"]],
        }}
      />
    );

    expect(screen.getByText("Column")).toBeInTheDocument();
    expect(screen.getByText("Row")).toBeInTheDocument();
  });
});
