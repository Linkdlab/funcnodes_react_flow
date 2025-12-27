import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const loadScript = (relativePath: string, contextOverrides: Record<string, any>) => {
  const filePath = path.resolve(__dirname, "..", relativePath);
  const code = fs.readFileSync(filePath, "utf8");
  const context = vm.createContext({
    ...contextOverrides,
  });
  vm.runInContext(code, context, { filename: filePath });
  return context;
};

describe("index.dev.js", () => {
  const originalHref = window.location.href;

  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    window.history.pushState({}, "", originalHref);
    document.body.innerHTML = "";
  });

  it("updates log visibility and toggles filters", () => {
    const levelFilters = { debug: true, info: false, warn: true, error: false };
    const container = document.createElement("div");
    container.className = "popup-content";

    ["debug", "info", "warn", "error"].forEach((level) => {
      const log = document.createElement("div");
      log.classList.add(level);
      container.appendChild(log);
    });

    const context = loadScript("index.dev.js", {
      window,
      document,
      URL,
      console,
    });

    context.updateLogVisibility(container, levelFilters, false);

    const [debugLog, infoLog, warnLog, errorLog] = Array.from(
      container.querySelectorAll("div")
    );

    expect(debugLog.style.display).toBe("block");
    expect(infoLog.style.display).toBe("none");
    expect(warnLog.style.display).toBe("block");
    expect(errorLog.style.display).toBe("none");

    const popupElement = context.make_logger_popup(levelFilters);
    expect(popupElement).toBeTruthy();

    const debugButton = document.querySelector(
      ".level-filter-debug"
    ) as HTMLButtonElement;
    debugButton.click();

    expect(levelFilters.debug).toBe(false);
    expect(debugButton.classList.contains("active")).toBe(false);
  });

  it("falls back to popup when window.open fails", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const levelFilters = { debug: true, info: true, warn: true, error: true };
    const originalOpen = window.open;
    window.open = () => null;

    const context = loadScript("index.dev.js", {
      window,
      document,
      URL,
      console,
    });

    const popupContent = context.make_logger_window(levelFilters);

    expect(popupContent).toBeTruthy();
    expect(document.getElementById("logger_content")).toBeTruthy();

    window.open = originalOpen;
    warnSpy.mockRestore();
  });

  it("initializes FuncNodes with worker URL and debug flag", async () => {
    const funcNodesCalls: any[] = [];
    const FuncNodes = (...args: any[]) => funcNodesCalls.push(args);

    window.history.pushState(
      {},
      "",
      "/?worker_url=ws://example&debug=0&dev=false"
    );

    const context = loadScript("index.dev.js", {
      window,
      document,
      URL,
      console,
      FuncNodes,
    });

    await context.window.onload();

    expect(funcNodesCalls.length).toBe(1);
    const [, options] = funcNodesCalls[0];
    expect(options.worker_url).toBe("ws://example");
    expect(options.debug).toBe(false);
  });
});

describe("index.prod.js", () => {
  const originalHref = window.location.href;

  afterEach(() => {
    window.history.pushState({}, "", originalHref);
  });

  it("parses params and boolean flags", async () => {
    const context = loadScript("index.prod.js", {
      window,
      document,
      URL,
      console,
      fetch: async () => ({
        ok: true,
        text: async () => "ws://worker-manager",
        json: async () => ({ ssl: false, host: "localhost", port: 1234 }),
      }),
      FuncNodes: vi.fn(),
      setTimeout,
    });

    window.history.pushState(
      {},
      "",
      "/?worker_url=ws://direct&debug=yes"
    );

    expect(context.getParam("worker_url")).toBe("ws://direct");
    expect(context.parseBool("", false)).toBe(true);
    expect(context.parseBool(null, false)).toBe(false);
    expect(context.parseBool("no", true)).toBe(false);

    const options = await context.get_fn_options();
    expect(options.useWorkerManager).toBe(false);
    expect(options.worker_url).toBe("ws://direct");
  });

  it("falls back to fetching worker URL and calls FuncNodes", async () => {
    const funcNodesCalls: any[] = [];
    const fetch = async (url: string) => {
      if (url === "/worker_manager") {
        return {
          ok: false,
          status: 500,
          text: async () => "",
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ ssl: true, host: "example.com", port: 4321 }),
        text: async () => "",
      };
    };

    const context = loadScript("index.prod.js", {
      window,
      document,
      URL,
      console,
      fetch,
      FuncNodes: (...args: any[]) => funcNodesCalls.push(args),
      setTimeout,
    });

    window.history.pushState({}, "", "/");

    await context.window.onload();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(funcNodesCalls.length).toBe(1);
    const [, options] = funcNodesCalls[0];
    expect(options.worker_url).toBe("wss://example.com:4321");
    expect(options.useWorkerManager).toBe(false);
  });
});
