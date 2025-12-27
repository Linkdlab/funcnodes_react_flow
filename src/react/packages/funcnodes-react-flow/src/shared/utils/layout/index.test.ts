import { describe, it, expect } from "vitest";
import { fitTextToContainer } from "./index";

const makeRect = (width: number, height: number): DOMRect =>
  ({
    width,
    height,
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  }) as DOMRect;

describe("fitTextToContainer", () => {
  it("keeps the max font size when the text already fits", () => {
    const container = document.createElement("div");
    Object.defineProperty(container, "getBoundingClientRect", {
      value: () => makeRect(200, 100),
    });

    const text = document.createElement("span");
    Object.defineProperty(text, "getBoundingClientRect", {
      value: () => {
        const size = Number.parseFloat(text.style.fontSize || "0");
        return makeRect(size * 2, size);
      },
    });

    fitTextToContainer(container, text, {
      maxFontSize: 30,
      minFontSize: 8,
      decrementFactor: 0.5,
    });

    expect(text.style.fontSize).toBe("30px");
  });

  it("reduces the font size until the text fits within the container", () => {
    const container = document.createElement("div");
    Object.defineProperty(container, "getBoundingClientRect", {
      value: () => makeRect(100, 20),
    });

    const text = document.createElement("span");
    Object.defineProperty(text, "getBoundingClientRect", {
      value: () => {
        const size = Number.parseFloat(text.style.fontSize || "0");
        return makeRect(size * 2, size);
      },
    });

    fitTextToContainer(container, text, {
      maxFontSize: 40,
      minFontSize: 10,
      decrementFactor: 0.5,
    });

    expect(text.style.fontSize).toBe("20px");
  });

  it("stops shrinking once the minimum font size is reached", () => {
    const container = document.createElement("div");
    Object.defineProperty(container, "getBoundingClientRect", {
      value: () => makeRect(10, 5),
    });

    const text = document.createElement("span");
    Object.defineProperty(text, "getBoundingClientRect", {
      value: () => {
        const size = Number.parseFloat(text.style.fontSize || "0");
        return makeRect(size * 2, size);
      },
    });

    fitTextToContainer(container, text, {
      maxFontSize: 40,
      minFontSize: 10,
      decrementFactor: 0.5,
    });

    expect(text.style.fontSize).toBe("10px");
  });

  it("throws when the decrement factor is invalid", () => {
    const container = document.createElement("div");
    Object.defineProperty(container, "getBoundingClientRect", {
      value: () => makeRect(100, 20),
    });

    const text = document.createElement("span");
    Object.defineProperty(text, "getBoundingClientRect", {
      value: () => makeRect(200, 40),
    });

    expect(() =>
      fitTextToContainer(container, text, {
        decrementFactor: 1,
      })
    ).toThrow("decrementFactor must be between 0 and 1");
  });
});
