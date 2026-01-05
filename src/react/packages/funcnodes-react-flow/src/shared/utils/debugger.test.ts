import { afterEach, describe, expect, it, vi } from "vitest";
import type { FuncNodesReactFlow } from "@/funcnodes-context";
import { isDevelopment, print_object, print_object_size } from "./debugger";

describe("debugger utils", () => {
  const originalDevFlag = (window as any)._FUNCNODES_DEV;

  afterEach(() => {
    (window as any)._FUNCNODES_DEV = originalDevFlag;
    vi.restoreAllMocks();
  });

  it("isDevelopment returns true when dev flag is set", () => {
    (window as any)._FUNCNODES_DEV = true;

    expect(isDevelopment()).toBe(true);
  });

  it("isDevelopment returns false when dev flag is set to false", () => {
    (window as any)._FUNCNODES_DEV = false;

    expect(isDevelopment()).toBe(false);
  });

  it("print_object_size logs size only when debug is enabled", () => {
    const logger = { debug: vi.fn() };
    const fnrf = {
      dev_settings: { debug: true },
      logger,
    } as unknown as FuncNodesReactFlow;

    print_object_size({ a: 1 }, "payload", fnrf);

    expect(logger.debug).toHaveBeenCalledWith(
      "Object size: 7 chars. payload"
    );
  });

  it("print_object_size skips logging when debug is disabled or context missing", () => {
    const logger = { debug: vi.fn() };
    const fnrf = {
      dev_settings: { debug: false },
      logger,
    } as unknown as FuncNodesReactFlow;

    print_object_size({ a: 1 }, "payload", fnrf);
    print_object_size({ a: 1 }, "payload", undefined);

    expect(logger.debug).not.toHaveBeenCalled();
  });

  it("print_object logs objects only when debug is enabled", () => {
    const logger = { debug: vi.fn() };
    const fnrf = {
      dev_settings: { debug: true },
      logger,
    } as unknown as FuncNodesReactFlow;

    const payload = { id: "node-1" };
    print_object(payload, fnrf);

    expect(logger.debug).toHaveBeenCalledWith("Object: ", payload);
  });
});
