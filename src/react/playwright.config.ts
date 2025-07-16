/// <reference types="node" />
import { defineConfig, devices } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

// Resolve __dirname in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pick a port unlikely to conflict. Adjust if needed.
const DEV_PORT = 5061;

// Check if server is already running
function isServerRunning(port: number): boolean {
  try {
    execSync(`curl -s http://localhost:${port}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

const serverAlreadyRunning = isServerRunning(DEV_PORT);

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: `http://localhost:${DEV_PORT}`,
    headless: false,
    viewport: { width: 1280, height: 720 },
    trace: "on-first-retry",
  },
  webServer: serverAlreadyRunning
    ? undefined
    : {
        command: "yarn e2eserver", //alternatively testscript?
        port: DEV_PORT,
        timeout: 60_000,
        reuseExistingServer: !process.env.CI,
        cwd: __dirname,
      },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  // Configure output
  reporter: [
    ["html", { outputFolder: "test-reports/html" }],
    ["json", { outputFile: "test-reports/results.json" }],
    ["junit", { outputFile: "test-reports/junit.xml" }],
  ],
});
