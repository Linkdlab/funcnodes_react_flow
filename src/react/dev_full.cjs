#!/usr/bin/env node
/*
 * dev_full.cjs
 * - Finds a free TCP port (or uses provided port)
 * - Launches FuncNodes backend on that port (_development_workers dir)
 * - Launches Vite in watch mode (on specified port or default)
 * - Prints URL and keeps running until terminated
 *
 * Usage:
 *   node dev_full.cjs [--funcnodes-port <port>] [--watch-port <port>]
 */

console.log("[DEBUG] Script starting...");
console.log("[DEBUG] Node version:", process.version);
console.log("[DEBUG] Platform:", process.platform);
console.log("[DEBUG] Working directory:", process.cwd());
console.log("[DEBUG] Script arguments:", process.argv);

const { spawn } = require("child_process");
const net = require("net");
const path = require("path");

async function getFreePort(start = 8790) {
  const MAX = start + 100;
  for (let port = start; port < MAX; port++) {
    if (await isFree(port)) return port;
  }
  throw new Error("No free port found");
}

function isFree(port) {
  return new Promise((res) => {
    const srv = net
      .createServer()
      .once("error", () => res(false))
      .once("listening", () => srv.close(() => res(true)))
      .listen(port, "127.0.0.1");
  });
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--funcnodes-port" && i + 1 < args.length) {
      options.funcnodesPort = parseInt(args[i + 1], 10);
      i++; // skip the next argument since it's the port value
    } else if (args[i] === "--watch-port" && i + 1 < args.length) {
      options.watchPort = parseInt(args[i + 1], 10);
      i++; // skip the next argument since it's the port value
    }
  }

  return options;
}

function setupChildOutput(child, prefix, color = "") {
  const reset = "\x1b[0m";

  child.stdout?.on("data", (data) => {
    const lines = data
      .toString()
      .split("\n")
      .filter((line) => line.trim());
    lines.forEach((line) => {
      console.log(`${color}[${prefix}]${reset} ${line}`);
    });
  });

  child.stderr?.on("data", (data) => {
    const lines = data
      .toString()
      .split("\n")
      .filter((line) => line.trim());
    lines.forEach((line) => {
      console.error(`${color}[${prefix}]${reset} ${line}`);
    });
  });

  child.on("error", (err) => {
    console.error(`${color}[${prefix} SPAWN ERROR]${reset} ${err.message}`);
    console.error(
      `${color}[${prefix} SPAWN ERROR]${reset} Command: ${child.spawnfile}`
    );
    console.error(
      `${color}[${prefix} SPAWN ERROR]${reset} Args: ${JSON.stringify(
        child.spawnargs
      )}`
    );
    console.error(`${color}[${prefix} SPAWN ERROR]${reset} Full error:`, err);
  });
}

(async () => {
  try {
    console.log("[DEBUG] Entering main async function...");
    const options = parseArgs();
    console.log("[DEBUG] Parsed options:", options);

    let PORT;
    console.log("[DEBUG] About to determine port...");
    if (options.funcnodesPort) {
      PORT = options.funcnodesPort;
      console.log(`[dev] Using specified backend port ${PORT}`);
    } else {
      console.log("[DEBUG] Finding free port...");
      PORT = await getFreePort();
      console.log(`[dev] Using auto-detected backend port ${PORT}`);
    }

    const backendCmd = [
      "funcnodes",
      "--dir",
      "_development_workers",
      "startworkermanager",
      "--port",
      String(PORT),
    ];

    const repoRoot = path.resolve(__dirname, "../../../..");
    const backendOpts = {
      stdio: "pipe",
      // shell: process.platform === 'win32',
      cwd: repoRoot,
    };
    const watchOpts = {
      stdio: "pipe",
      // shell: process.platform === 'win32',
      cwd: __dirname,
      env: { ...process.env, FN_WORKER_PORT: String(PORT) },
    };

    console.log("[dev] Starting backend:", backendCmd.join(" "));
    console.log("[dev] Backend working directory:", repoRoot);
    const backend = spawn(backendCmd[0], backendCmd.slice(1), backendOpts);

    // Setup output handling for backend with blue color
    setupChildOutput(backend, "BACKEND", "\x1b[34m");

    backend.on("exit", (code, signal) => {
      console.log(
        `\x1b[34m[BACKEND EXIT]\x1b[0m Process exited with code ${code}, signal ${signal}`
      );
      console.log(`[dev] Backend exited (${code}). Shutting down watcher.`);
      if (!watch.killed) watch.kill("SIGINT");
      process.exit(code ?? 0);
    });

    console.log("[dev] Starting Vite watcher…");
    const watchArgs = ["watch", "--host", "0.0.0.0"];
    if (options.watchPort) {
      watchArgs.push("--port", String(options.watchPort));
      console.log(`[dev] Using specified watch port ${options.watchPort}`);
    }
    console.log("[dev] Watch working directory:", __dirname);
    const watch = spawn("yarn", watchArgs, watchOpts);

    // Setup output handling for watcher with green color
    setupChildOutput(watch, "WATCHER", "\x1b[32m");

    watch.on("exit", (code, signal) => {
      console.log(
        `\x1b[32m[WATCHER EXIT]\x1b[0m Process exited with code ${code}, signal ${signal}`
      );
      console.log(
        `[dev] Vite watcher exited (${code}). Shutting down backend.`
      );
      if (!backend.killed) backend.kill("SIGINT");
      process.exit(code ?? 0);
    });

    const cleanup = () => {
      console.log("[dev] Cleaning up…");
      if (!backend.killed) backend.kill("SIGINT");
      if (!watch.killed) watch.kill("SIGINT");
    };
    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
  } catch (error) {
    console.error("[DEBUG] Error in main function:", error);
    console.error("[DEBUG] Stack trace:", error.stack);
    process.exit(1);
  }
})().catch((error) => {
  console.error("[DEBUG] Unhandled promise rejection:", error);
  process.exit(1);
});
