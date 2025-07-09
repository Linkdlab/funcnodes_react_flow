/// <reference types="node" />
import { defineConfig } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve __dirname in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pick a port unlikely to conflict. Adjust if needed.
const BACKEND_PORT = 8787;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: `http://localhost:${BACKEND_PORT}`,
    headless: false,
    viewport: { width: 1280, height: 720 },
    trace: 'on-first-retry',
  },
  webServer: {
    command: `uv run funcnodes runserver --port ${BACKEND_PORT} --no-browser`,
    port: BACKEND_PORT,
    timeout: 60_000,
    reuseExistingServer: !process.env.CI,
    cwd: path.resolve(__dirname, '../../../../backend/FuncNodes'),
  },
}); 