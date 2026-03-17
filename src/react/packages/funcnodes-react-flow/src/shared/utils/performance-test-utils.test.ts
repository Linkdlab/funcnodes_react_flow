import { describe, expect, it, vi } from "vitest";

import { retryPerformanceAssertion } from "./performance-test-utils";

describe("retryPerformanceAssertion", () => {
  it("returns after the first successful attempt", async () => {
    const assertion = vi.fn();
    const afterFailure = vi.fn();

    await retryPerformanceAssertion(assertion, { afterFailure });

    expect(assertion).toHaveBeenCalledTimes(1);
    expect(assertion).toHaveBeenCalledWith(1);
    expect(afterFailure).not.toHaveBeenCalled();
  });

  it("retries failed assertions up to the configured attempt count", async () => {
    const assertion = vi
      .fn()
      .mockRejectedValueOnce(new Error("first failure"))
      .mockRejectedValueOnce(new Error("second failure"))
      .mockResolvedValueOnce(undefined);
    const afterFailure = vi.fn();

    await retryPerformanceAssertion(assertion, {
      attempts: 3,
      afterFailure,
    });

    expect(assertion).toHaveBeenCalledTimes(3);
    expect(assertion).toHaveBeenNthCalledWith(1, 1);
    expect(assertion).toHaveBeenNthCalledWith(2, 2);
    expect(assertion).toHaveBeenNthCalledWith(3, 3);
    expect(afterFailure).toHaveBeenCalledTimes(2);
    expect(afterFailure).toHaveBeenNthCalledWith(
      1,
      1,
      expect.objectContaining({ message: "first failure" })
    );
    expect(afterFailure).toHaveBeenNthCalledWith(
      2,
      2,
      expect.objectContaining({ message: "second failure" })
    );
  });

  it("throws the last failure after exhausting all attempts", async () => {
    const assertion = vi
      .fn()
      .mockRejectedValueOnce(new Error("first failure"))
      .mockRejectedValueOnce(new Error("second failure"))
      .mockRejectedValueOnce(new Error("final failure"));
    const afterFailure = vi.fn();

    await expect(
      retryPerformanceAssertion(assertion, {
        attempts: 3,
        afterFailure,
      })
    ).rejects.toThrow("final failure");

    expect(assertion).toHaveBeenCalledTimes(3);
    expect(afterFailure).toHaveBeenCalledTimes(2);
  });
});
