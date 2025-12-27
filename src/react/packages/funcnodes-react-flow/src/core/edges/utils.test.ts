import { describe, expect, it } from "vitest";
import { generate_edge_id } from "./utils";

describe("generate_edge_id", () => {
  it("creates a stable id regardless of endpoint order", () => {
    const forward = generate_edge_id({
      src_nid: "a",
      src_ioid: "1",
      trg_nid: "b",
      trg_ioid: "2",
    });
    const reverse = generate_edge_id({
      src_nid: "b",
      src_ioid: "2",
      trg_nid: "a",
      trg_ioid: "1",
    });

    expect(forward).toBe("a:1--b:2");
    expect(reverse).toBe("a:1--b:2");
  });
});
