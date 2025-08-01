// vite.test.config.js - Configuration for browser testing
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { loadAliasesFromTsConfig } from "./vite.config.js"; // Import the alias loading function

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function htmlTransformPlugin() {
  return {
    name: "html-transform-plugin-test",
    async transformIndexHtml(html) {
      // Read the test initialization script
      const scriptPath = path.resolve(__dirname, "index.test.js");
      const scriptContent = await fs.readFile(scriptPath, "utf-8");

      // Get test configuration from environment
      const workerPort = process.env.TEST_FN_WORKER_PORT || "9381";
      const testConfig = process.env.TEST_CONFIG || "{}";

      // Replace the placeholder with test-specific script
      return html.replace(
        "<!-- WORKER_SCRIPT -->",
        `<script>
          window.FN_WORKER_PORT=${workerPort};
          window.TEST_CONFIG=${testConfig};
        </script>
        <script type="module">${scriptContent}</script>`
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), htmlTransformPlugin()],
  server: {
    port: 5174, // Different port for test server
    host: true,
  },
  resolve: {
    alias: loadAliasesFromTsConfig(),
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("test"),
    __FN_VERSION__: JSON.stringify("test"),
    global: "window",
  },
});
