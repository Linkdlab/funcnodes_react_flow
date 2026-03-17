import { defineConfig } from "vitest/config";
import { loadAliasesFromTsConfig } from "./vite.config";

export default defineConfig({
  define: {
    __FN_VERSION__: JSON.stringify("test"),
  },
  resolve: {
    alias: {
      ...loadAliasesFromTsConfig(),
    },
  },

  // If you're not actually running Node 14, targeting it is not a speed win.
  // Prefer your real CI node version (e.g. node18/node20) to reduce transforms.
  // esbuild: { target: "node20" },

  test: {
    globals: true,
    css: false,
    testTimeout: 30000, // 30 seconds

    // Common excludes once
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/tests/e2e/**",
      "**/*.e2e.*",
    ],

    // IMPORTANT: move setupFiles into the DOM project only
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          environment: "node",
          pool: "threads",
          isolate: false,

          include: [
            "tests/**/*.{test,spec}.{js,ts}",
            "src/**/*.{test,spec}.{js,ts}",
          ],
          exclude: [
            "**/*.{test,spec}.{jsx,tsx}", // keep TSX out of node env
          ],
        },
      },
      {
        extends: true,
        test: {
          name: "dom",
          environment: "jsdom", // or "happy-dom" if you can
          pool: "threads",      // switch to "forks" here if you hit thread issues
          isolate: true,

          setupFiles: "./src/setupTests.ts",

          include: [
            "tests/**/*.{test,spec}.{jsx,tsx}",
            "src/**/*.{test,spec}.{jsx,tsx}",
          ],

        },
      },
    ],

    coverage: {
      provider: "v8",
      include: ["**/src/**/*.{js,jsx,ts,tsx}"],
      exclude: [
        "**/*.d.ts",
        "**/*.test.*",
        "**/*.spec.*",
        "**/node_modules/**",
        "**/dist/**",
        "**/coverage/**",
      ],
    },
  },
});
