import * as React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { IOContext } from "@/nodes";
import type { IOStore } from "@/nodes-core";
import { Base64BytesInLineRenderer } from "./inline-renderer/bytes";
import { InLineOutput } from "./output-renderer/default";

const createIOStore = (preview: any, full?: any) =>
  ({
    valuestore: () => ({ preview, full }),
  }) as unknown as IOStore;

describe("inline and output renderers", () => {
  it("renders byte length for inline base64 output", () => {
    const preview = { value: "AAAA" };
    const iostore = createIOStore(preview);

    const { container } = render(
      <IOContext.Provider value={iostore}>
        <Base64BytesInLineRenderer />
      </IOContext.Provider>
    );

    const disp = JSON.stringify(preview.value) || "";
    const expectedLength = Math.round((3 * disp.length) / 4);
    expect(container.textContent).toBe(`Bytes(${expectedLength})`);
  });

  it("truncates long inline output", () => {
    const longValue = {
      toJSON: () => "x".repeat(120),
    };
    const iostore = createIOStore(longValue);

    const { container } = render(
      <IOContext.Provider value={iostore}>
        <InLineOutput />
      </IOContext.Provider>
    );

    expect(container.textContent?.endsWith("...")).toBe(true);
  });
});
