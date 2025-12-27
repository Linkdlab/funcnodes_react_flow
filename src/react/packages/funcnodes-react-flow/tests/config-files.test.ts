// @vitest-environment node
import { describe, it, expect, vi } from "vitest";

import browserConfig from "../vite.browser.config.js";
import testConfig from "../vite.test.config.js";

const execSyncMock = vi.fn();
vi.mock("node:child_process", () => ({
  execSync: execSyncMock,
}));

const findPlugin = (plugins: any[], name: string) =>
  plugins.find((plugin) => plugin && plugin.name === name);

describe("vite browser config", () => {
  it("injects worker script and defines build settings", async () => {
    process.env.FN_WORKER_PORT = "1234";

    const configFactory = browserConfig as unknown as (args: {
      mode: string;
    }) => any;
    const config = configFactory({ mode: "production" });

    expect(config.base).toBe("/static");
    expect(config.define.__FN_VERSION__).toBeTruthy();

    const plugin = findPlugin(config.plugins, "html-transform-plugin");
    const html = "<html><!-- WORKER_SCRIPT --></html>";
    const result = await plugin.transformIndexHtml(html);

    expect(result).toContain("window.FN_WORKER_PORT=1234");
    expect(result).toContain("function getParam");
  });
});

describe("vite test config", () => {
  it("injects test config script", async () => {
    process.env.TEST_FN_WORKER_PORT = "4321";
    process.env.TEST_CONFIG = '{"flag":true}';

    const config = testConfig as unknown as { plugins: any[] };
    const plugin = findPlugin(config.plugins, "html-transform-plugin-test");

    const html = "<html><!-- WORKER_SCRIPT --></html>";
    const result = await plugin.transformIndexHtml(html);

    expect(result).toContain("window.FN_WORKER_PORT=4321");
    expect(result).toContain("window.TEST_CONFIG={\"flag\":true}");
  });
});

describe("playwright config", () => {
  it("exports chromium project with expected base URL", async () => {
    execSyncMock.mockImplementation(() => "");
    vi.resetModules();

    const { default: playwrightConfig } = await import(
      "../playwright.config.ts"
    );

    expect(playwrightConfig.projects[0].name).toBe("chromium");
    expect(playwrightConfig.use?.baseURL).toContain("http://localhost");
  });
});
