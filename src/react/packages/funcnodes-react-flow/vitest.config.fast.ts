import { defineConfig } from "vitest/config";
import { loadAliasesFromTsConfig } from "./vite.config";

// Fast test configuration that avoids slow Vite config merging
export default defineConfig({
  define: {
    __FN_VERSION__: JSON.stringify("test"),
  },
  test: {
    globals: true,
    environment: "jsdom", // Use jsdom for better compatibility in CI
    setupFiles: "./src/setupTests.ts",
    css: false, // Disable CSS processing for faster tests
    testTimeout: 30000,
    include: [
      "tests/**/*.{test,spec}.{js,ts,tsx}",
      "src/**/*.{test,spec}.{js,ts,tsx}",
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/tests/e2e/**",
      "**/*.e2e.*",
      "**/keypress-provider*.test.tsx",
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
    pool: "forks", // Use forks instead of vmThreads for faster startup
    isolate: true, // Enable isolation for reliable test execution in CI
    deps: {
      optimizer: {
        web: {
          enabled: true,
        },
      },
    },
  },
  resolve: {
    alias: {
      ...loadAliasesFromTsConfig(),
    },
  },
  esbuild: {
    target: "node14", // Lower target for faster transpilation
  },
});
