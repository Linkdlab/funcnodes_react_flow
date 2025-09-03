// vite.browser.config.js
// Neo protects this file from agents
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import { loadAliasesFromTsConfig } from "./vite.config.js"; // Import the alias loading function
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function htmlTransformPlugin(mode) {
  return {
    name: "html-transform-plugin",
    async transformIndexHtml(html) {
      // Check for custom script file from environment variable
      let scriptfile;
      if (process.env.FN_CUSTOM_SCRIPT) {
        scriptfile = process.env.FN_CUSTOM_SCRIPT;
      } else {
        scriptfile = mode === "production" ? "index.prod.js" : "index.dev.js";
      }
      // Resolve the absolute path of the file.
      const filePath = path.resolve(__dirname, scriptfile);
      // Read the file content as a string.
      const scriptContent = await fs.readFile(filePath, "utf-8");
      // Replace the placeholder in your HTML with the script tag containing the file content.
      const workerPort = process.env.FN_WORKER_PORT || "9380";
      return html.replace(
        "<!-- WORKER_SCRIPT -->",
        `<script>window.FN_WORKER_PORT=${workerPort};</script><script>${scriptContent}</script>`
      );
    },
  };
}

export default defineConfig(({ mode }) => {
  const production = mode === "production";
  // load version number from package.json
  const pkg = JSON.parse(
    readFileSync(path.resolve(__dirname, "./package.json"), "utf-8")
  );
  const version = pkg.version;
  const basename = pkg.name.replace(/@.*\//, "");

  return {
    plugins: [react(), htmlTransformPlugin(mode)],
    base: "/static", // Set the base URL for the app (e.g., for deployment)
    resolve: {
      alias: loadAliasesFromTsConfig(),
    },
    server: {
      watch: {
        usePolling: true,
        additionalPaths: (watcher) => {
          watcher.add(path.resolve(__dirname, "src/**")); // Watch all files in the src directory
        },
      },
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
      "process.env.FA_VERSION": JSON.stringify(
        process.env.FA_VERSION || "7.0.0"
      ),
      __FN_VERSION__: JSON.stringify(version), // Define the version number
      global: "window", // replacement if you need the global object in browser builds.
    },
    build: {
      sourcemap: !production,
      target: "es2020",
      cssCodeSplit: false, // disable CSS code splitting, css will be in a separate file
      assetsInlineLimit: 0, // disable inlining assets; output them as separate files
      outDir: production
        ? path.resolve(__dirname, "../../../funcnodes_react_flow/static/")
        : `build/${production ? "prod" : "dev"}`, // output directory for the build

      lib: {
        entry: path.resolve(__dirname, "index.html"), // your library's entry point
        formats: ["iife", "es"], // output format
        name: basename, // change as needed
        fileName: (format) => `${basename}.${format}.js`, // output file name pattern
        emitAssets: false, // disable asset emission
      },
      rollupOptions: {
        output: {
          banner: "var global = window;",
          // Ensure browser build outputs to separate directory
          dir: production
            ? path.resolve(__dirname, "../../../funcnodes_react_flow/static/")
            : path.resolve(__dirname, `build/${production ? "prod" : "dev"}`),
        },
        // If you need to bundle all dependencies (i.e. non-externalized) for a browser IIFE,
        // you can adjust the external config accordingly (or leave external: [] as desired)
        external: [],
      },
    },
  };
});
