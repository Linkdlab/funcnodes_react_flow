import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import dts from "vite-plugin-dts";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function loadAliasesFromTsConfig() {
  const tsconfigPath = path.resolve(__dirname, "tsconfig.json");
  const tsconfigContent = readFileSync(tsconfigPath, "utf-8");

  // More robust JSONC cleaning
  let cleanContent = tsconfigContent;

  // Remove /* */ comments (including multi-line and inline)
  cleanContent = cleanContent.replace(/\/\*\s[\s\S]+?\*\//g, "");

  // Remove // comments but preserve the rest of the line
  cleanContent = cleanContent.replace(/\/\/.*$/gm, "");

  // Remove trailing commas before closing brackets/braces
  cleanContent = cleanContent.replace(/,(\s*[}\]])/g, "$1");

  // Remove any remaining whitespace-only lines
  cleanContent = cleanContent.replace(/^\s*$/gm, "");

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
        rollupTypes: true,
      }),
    ],
    resolve: {
      alias: {
        ...loadAliasesFromTsConfig(),
        // add any additional alias entries if needed
      },
    },
    define: {
      __FN_VERSION__: JSON.stringify(version),
    },
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
