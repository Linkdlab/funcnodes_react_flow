import { describe, expect, it, vi } from "vitest";

describe("data-rendering module graph", () => {
  it("imports @/data-rendering without circular initialization failures", async () => {
    vi.resetModules();
    await expect(import("@/data-rendering")).resolves.toBeTruthy();
  });
});
