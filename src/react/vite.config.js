import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import dts from "vite-plugin-dts";

export default defineConfig(({ mode }) => {
  const production = mode === "production";
  const pkg = require("./package.json");
  const version = pkg.version;
  const basename = pkg.name.replace(/@.*\//, "");
  return {
    plugins: [
      react(),
      dts({
        // Options for generating .d.ts files;
        // This serves as an alternative to your rollup-plugin-dts usage.
        insertTypesEntry: true,
      }),
    ],
    resolve: {
      alias: {
        // add any alias entries that you used in your rollup config
        // For example:
        // '@components': path.resolve(__dirname, 'src/components'),
      },
    },
    define: {},
    build: {
      sourcemap: !production,
      cssCodeSplit: false, // disable CSS code splitting, css will be in a separate file
      lib: {
        entry: path.resolve(__dirname, "src/index.tsx"), // your library's entry point
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
