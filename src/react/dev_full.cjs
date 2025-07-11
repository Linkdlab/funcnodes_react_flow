#!/usr/bin/env node
/*
 * dev_full.cjs
 * - Finds a free TCP port
 * - Launches FuncNodes backend on that port (_development_workers dir)
 * - Launches Vite in watch mode
 * - Prints URL and keeps running until terminated
 */
const { spawn } = require('child_process');
const net = require('net');
const path = require('path');

async function getFreePort(start = 8790) {
  const MAX = start + 100;
  for (let port = start; port < MAX; port++) {
    if (await isFree(port)) return port;
  }
  throw new Error('No free port found');
}

function isFree(port) {
  return new Promise((res) => {
    const srv = net.createServer()
      .once('error', () => res(false))
      .once('listening', () => srv.close(() => res(true)))
      .listen(port, '127.0.0.1');
  });
}

(async () => {
  const PORT = await getFreePort();
  console.log(`[dev] Using backend port ${PORT}`);

  const backendCmd = [
    'funcnodes',
    '--dir',
    '_development_workers',
    'startworkermanager',
    '--port',
    String(PORT),
  ];

  const repoRoot = path.resolve(__dirname, '../../../..');
  const backendOpts = {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    cwd: repoRoot,
  };
  const watchOpts = {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    cwd: __dirname,
    env: { ...process.env, FN_WORKER_PORT: String(PORT) },
  };

  console.log('[dev] Starting backend:', backendCmd.join(' '));
  const backend = spawn(backendCmd[0], backendCmd.slice(1), backendOpts);

  backend.on('exit', (code) => {
    console.log(`[dev] Backend exited (${code}). Shutting down watcher.`);
    if (!watch.killed) watch.kill('SIGINT');
    process.exit(code ?? 0);
  });

  console.log('[dev] Starting Vite watcher…');
  const watch = spawn('yarn', ['watch'], watchOpts);

  watch.on('exit', (code) => {
    console.log(`[dev] Vite watcher exited (${code}). Shutting down backend.`);
    if (!backend.killed) backend.kill('SIGINT');
    process.exit(code ?? 0);
  });

  const cleanup = () => {
    console.log('[dev] Cleaning up…');
    if (!backend.killed) backend.kill('SIGINT');
    if (!watch.killed) watch.kill('SIGINT');
  };
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

})(); 