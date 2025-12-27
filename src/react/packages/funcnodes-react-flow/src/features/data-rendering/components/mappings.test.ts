import { describe, it, expect } from "vitest";

import {
  DefaultDataViewRenderer,
  DefaultDataPreviewViewRenderer,
  DefaultDataOverlayRenderer,
  DefaultHandlePreviewRenderer,
  DefaultInputRenderer,
  DefaultInLineRenderer,
  DefaultOutputRenderer,
  FallbackDataViewRenderer,
  FallbackDataPreviewViewRenderer,
  FallbackOverlayRenderer,
  FallbackHandlePreviewRenderer,
  FallbackOutputRenderer,
} from "./index";

const expectedViewKeys = [
  "string",
  "str",
  "table",
  "image",
  "svg",
  "dict",
  "bytes",
];

describe("default render mappings", () => {
  it("includes the expected data view renderer keys", () => {
    expectedViewKeys.forEach((key) => {
      expect(DefaultDataViewRenderer[key]).toBeDefined();
    });
  });

  it("creates preview and overlay renderers for default view keys", () => {
    expectedViewKeys.forEach((key) => {
      expect(DefaultDataPreviewViewRenderer[key]).toBeDefined();
      expect(DefaultDataOverlayRenderer[key]).toBeDefined();
    });
  });

  it("creates handle preview renderers for preview keys", () => {
    Object.keys(DefaultDataPreviewViewRenderer).forEach((key) => {
      expect(DefaultHandlePreviewRenderer[key]).toBeDefined();
    });
  });

  it("exposes default input/output/inline renderers", () => {
    expect(DefaultInputRenderer.bytes).toBeDefined();
    expect(DefaultInLineRenderer.bytes).toBeDefined();
    expect(DefaultOutputRenderer).toBeDefined();
  });

  it("exposes fallback renderers", () => {
    expect(typeof FallbackDataViewRenderer).toBe("function");
    expect(typeof FallbackDataPreviewViewRenderer).toBe("function");
    expect(typeof FallbackOverlayRenderer).toBe("function");
    expect(typeof FallbackHandlePreviewRenderer).toBe("function");
    expect(typeof FallbackOutputRenderer).toBe("function");
  });
});
