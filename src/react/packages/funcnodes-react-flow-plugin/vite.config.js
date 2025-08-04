import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import dts from "vite-plugin-dts";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const pkg = require("./package.json");
  const basename = pkg.name.replace(/@.*\//, "");

  return {
    plugins: [
      react(),
      dts({
        // Options for generating .d.ts files;
        // This serves as an alternative to your rollup-plugin-dts usage.
        insertTypesEntry: true,
        rollupTypes: true,
      }),
    ],
    define: {},
    build: {
      sourcemap: false,
      lib: {
        entry: path.resolve(__dirname, "src/index.ts"), // your library's entry point
        name: basename, // change as needed
        formats: ["es", "cjs", "umd"], // output ESM, CommonJS, and UMD formats
        fileName: (format) => `[name].${format}.js`, // output file name pattern
      },
      rollupOptions: {
        // Ensure peer dependencies (or external ones) are marked external
        external: Object.keys(pkg.peerDependencies || {}),
      },
    },
  };
});
