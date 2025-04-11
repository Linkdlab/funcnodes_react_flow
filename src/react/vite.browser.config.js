// vite.browser.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs/promises";
import path from "path";

function htmlTransformPlugin(mode) {
  return {
    name: "html-transform-plugin",
    async transformIndexHtml(html) {
      // Choose the script file based on the current mode.
      const scriptfile =
        mode === "production" ? "index.prod.js" : "index.dev.js";
      // Resolve the absolute path of the file.
      const filePath = path.resolve(__dirname, scriptfile);
      console.log("filePath", filePath);
      // Read the file content as a string.
      const scriptContent = await fs.readFile(filePath, "utf-8");
      // Replace the placeholder in your HTML with the script tag containing the file content.
      return html.replace(
        "<!-- WORKER_SCRIPT -->",
        `<script>${scriptContent}</script>`
      );
    },
  };
}

export default defineConfig(({ mode }) => {
  const production = mode === "production";
  // laod version number from package.json
  const pkg = require("./package.json");
  const version = pkg.version;
  const basename = pkg.name.replace(/@.*\//, "");

  return {
    plugins: [react(), htmlTransformPlugin(mode)],
    base: "static", // Set the base URL for the app (e.g., for deployment)
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
      __FN_VERSION__: JSON.stringify(version), // Define the version number
      global: "window", // replacement if you need the global object in browser builds.
    },
    build: {
      sourcemap: !production,
      target: "es2020",
      cssCodeSplit: false, // disable CSS code splitting, css will be in a separate file
      assetsInlineLimit: 0, // disable inlining assets; output them as separate files
      outDir: production
        ? `../funcnodes_react_flow/static/`
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
        },
        // If you need to bundle all dependencies (i.e. non-externalized) for a browser IIFE,
        // you can adjust the external config accordingly (or leave external: [] as desired)
        external: [],
      },
    },
  };
});
