import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import dts from "vite-plugin-dts";
import { readFileSync } from "fs";

export function loadAliasesFromTsConfig() {
  try {
    const tsconfigPath = path.resolve(__dirname, "tsconfig.json");
    const tsconfigContent = readFileSync(tsconfigPath, "utf-8");
    // Strip comments and trailing commas from JSONC
    const cleanContent = tsconfigContent
      .replace(/\/\*[\s\S]*?\*\//g, "") // Remove /* */ comments
      .replace(/\/\/.*$/gm, "") // Remove // comments
      .replace(/,(\s*[}\]])/g, "$1"); // Remove trailing commas
    const tsconfig = JSON.parse(cleanContent);
    const paths = tsconfig.compilerOptions?.paths || {};

    const aliases = {};
    for (const [alias, pathArray] of Object.entries(paths)) {
      if (pathArray.length > 0) {
        // Remove /* suffix from alias and path, take first path from array
        const cleanAlias = alias.replace(/\/\*$/, "");
        const cleanPath = pathArray[0].replace(/\/\*$/, "");
        // Convert relative path to absolute path
        aliases[cleanAlias] = path.resolve(__dirname, cleanPath);
      }
    }

    return aliases;
  } catch (error) {
    console.warn("Failed to load aliases from tsconfig.json:", error);
    return {};
  }
}

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
