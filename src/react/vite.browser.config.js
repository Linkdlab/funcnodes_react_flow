// vite.browser.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const production = mode === "production";

  // laod version number from package.json
  const pkg = require("./package.json");
  const version = pkg.version;
  const basename = pkg.name.replace(/@.*\//, "");

  return {
    plugins: [
      react(),
      // You can integrate rollup plugins (like replace) directly in Vite's Rollup options:
    ],
    base: "", // Set the base URL for the app (e.g., for deployment)
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
      global: "window", // replacement if you need the global object in browser builds.
    },
    build: {
      sourcemap: !production,
      target: "es2020",
      cssCodeSplit: false, // disable CSS code splitting, css will be in a separate file
      outDir: "build",
      rollupOptions: {
        output: {
          banner: "var global = window;",
          format: "iife",
          entryFileNames: `assets/${basename}-${version}.js`,
          chunkFileNames: `assets/${basename}-[name]-${version}.js`,
          assetFileNames: `assets/${basename}-[name]-${version}.[ext]`,
        },
        // If you need to bundle all dependencies (i.e. non-externalized) for a browser IIFE,
        // you can adjust the external config accordingly (or leave external: [] as desired)
        external: [],
      },
      // If you have multiple entry points (e.g., one for JS and one for CSS), you can specify:
      // rollupOptions: {
      //   input: {
      //     main: path.resolve(__dirname, 'src/browser_index.tsx'),
      //     style: path.resolve(__dirname, 'src/index.scss'),
      //   },
      // }
      // (Vite will output separate bundles based on these entries)
    },
  };
});
