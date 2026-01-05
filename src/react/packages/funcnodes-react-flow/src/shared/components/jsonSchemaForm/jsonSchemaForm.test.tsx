import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

const ORIGINAL_CONSOLE_WARN = console.warn;
const ORIGINAL_CONSOLE_ERROR = console.error;

const collectConsoleCalls = (spy: ReturnType<typeof vi.spyOn>) =>
  spy.mock.calls.map((args:any[]) => args.map(String).join(" ")).join("\n");

describe("jsonSchemaForm theme", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    console.warn = ORIGINAL_CONSOLE_WARN;
    console.error = ORIGINAL_CONSOLE_ERROR;
  });

  it("does not emit MUI palette channel warnings when importing the module", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await import("./index");

    const output = [collectConsoleCalls(warnSpy), collectConsoleCalls(errorSpy)]
      .filter(Boolean)
      .join("\n");

    expect(output).not.toContain("MUI: Can't create `palette.");
  });
});
