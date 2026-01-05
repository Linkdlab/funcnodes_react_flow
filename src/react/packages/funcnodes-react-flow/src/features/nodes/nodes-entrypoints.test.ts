import { describe, expect, it, vi } from "vitest";

describe("nodes entrypoints", () => {
  it("does not export hooks or node-renderer components from @/nodes", async () => {
    vi.resetModules();
    const nodes = await import("@/nodes");

    expect(nodes).toHaveProperty("useIOStore");
    expect(nodes).toHaveProperty("useNodeStore");
    expect(nodes).toHaveProperty("IOContext");
    expect(nodes).toHaveProperty("NodeContext");

    expect(nodes).not.toHaveProperty("useSetIOValue");
    expect(nodes).not.toHaveProperty("useIOGetFullValue");
    expect(nodes).not.toHaveProperty("DefaultNode");
    expect(nodes).not.toHaveProperty("NodeName");
  });

  it("exports hooks from @/nodes-hooks", async () => {
    vi.resetModules();
    const hooks = await import("@/nodes-hooks");

    expect(hooks).toHaveProperty("useBodyDataRendererForIo");

    expect(typeof hooks.useBodyDataRendererForIo).toBe("function");
  });

  it("exports IO helper hooks from @/nodes-io-hooks", async () => {
    vi.resetModules();
    const hooks = await import("@/nodes-io-hooks");

    expect(hooks).toHaveProperty("useSetIOValue");
    expect(hooks).toHaveProperty("useIOGetFullValue");
    expect(hooks).toHaveProperty("useIOSetHidden");

    expect(hooks).not.toHaveProperty("useBodyDataRendererForIo");

    expect(typeof hooks.useSetIOValue).toBe("function");
    expect(typeof hooks.useIOGetFullValue).toBe("function");
    expect(typeof hooks.useIOSetHidden).toBe("function");
  });

  it("exports node-renderer components from @/nodes-components", async () => {
    vi.resetModules();
    const components = await import("@/nodes-components");

    expect(components).toHaveProperty("DefaultNode");
    expect(components).toHaveProperty("NodeName");
  });
});
