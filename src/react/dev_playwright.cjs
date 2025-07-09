#!/usr/bin/env node
/*
 * dev_playwright.cjs - CommonJS version
 */
const { spawn } = require('child_process');
const { chromium } = require('@playwright/test');

(async () => {
  const PORT = process.env.FN_PORT || '8790';
  const backendCmd = [
    'uv',
    'run',
    'funcnodes',
    '--dir',
    'development_workers',
    'runserver',
    '--port',
    PORT,
    '--no-browser',
  ];

  console.log('[dev] Starting backend:', backendCmd.join(' '));
  const backend = spawn(backendCmd[0], backendCmd.slice(1), {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  backend.on('exit', (code) => {
    console.log(`[dev] Backend exited with code ${code}`);
    process.exit(code ?? 0);
  });

  const cleanup = async () => {
    console.log('[dev] Shutting down…');
    try {
      await browser?.close();
    } catch (_) {}
    if (!backend.killed) backend.kill('SIGINT');
    process.exit(0);
  };
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  await new Promise((r) => setTimeout(r, 5000));

  console.log('[dev] Launching Playwright browser…');
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(`http://localhost:${PORT}`);
  console.log(`[dev] Browser opened at http://localhost:${PORT}`);
})(); 