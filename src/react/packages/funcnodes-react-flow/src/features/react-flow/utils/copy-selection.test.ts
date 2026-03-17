import { afterEach, describe, expect, it } from "vitest";

import { shouldPreserveNativeCopy } from "./copy-selection";

const clearSelection = () => {
  const selection = window.getSelection();
  selection?.removeAllRanges();
};

describe("shouldPreserveNativeCopy", () => {
  afterEach(() => {
    clearSelection();
    document.body.innerHTML = "";
  });

  it("returns true for a rendered text selection", () => {
    const text = document.createElement("div");
    text.textContent = "copy this text";
    document.body.appendChild(text);

    const selection = window.getSelection();
    const range = document.createRange();
    range.setStart(text.firstChild as Text, 0);
    range.setEnd(text.firstChild as Text, 4);
    selection?.removeAllRanges();
    selection?.addRange(range);

    expect(shouldPreserveNativeCopy()).toBe(true);
  });

  it("returns true for an input selection", () => {
    const input = document.createElement("input");
    input.value = "abcdef";
    document.body.appendChild(input);

    input.focus();
    input.setSelectionRange(1, 4);

    expect(shouldPreserveNativeCopy()).toBe(true);
  });

  it("returns true for a textarea selection", () => {
    const textarea = document.createElement("textarea");
    textarea.value = "abcdef";
    document.body.appendChild(textarea);

    textarea.focus();
    textarea.setSelectionRange(2, 5);

    expect(shouldPreserveNativeCopy()).toBe(true);
  });

  it("returns false for collapsed selections", () => {
    const text = document.createElement("div");
    text.textContent = "copy this text";
    document.body.appendChild(text);

    const selection = window.getSelection();
    const range = document.createRange();
    range.setStart(text.firstChild as Text, 2);
    range.setEnd(text.firstChild as Text, 2);
    selection?.removeAllRanges();
    selection?.addRange(range);

    expect(shouldPreserveNativeCopy()).toBe(false);
  });

  it("returns true for nokey targets", () => {
    const container = document.createElement("div");
    container.className = "nokey";
    const child = document.createElement("span");
    container.appendChild(child);
    document.body.appendChild(container);

    expect(shouldPreserveNativeCopy(child)).toBe(true);
  });
});
