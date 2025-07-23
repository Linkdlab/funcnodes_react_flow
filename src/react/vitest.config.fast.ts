import { defineConfig } from "vitest/config";
import path from "path";

// Fast test configuration that avoids slow Vite config merging
export default defineConfig({
  test: {
    globals: true,
    environment: "happy-dom", // Faster than jsdom
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
    pool: "forks", // Use forks instead of vmThreads for faster startup
    poolOptions: {
      forks: {
        isolate: false, // Disable isolation for faster tests
      },
    },
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
      // Simplified aliases for tests only
      "@": path.resolve(__dirname, "./src"),
      "@/barrel_imports": path.resolve(__dirname, "./src/barrel_imports.ts"),
      "@/shared-components": path.resolve(__dirname, "./src/shared/components"),
      "@/utils": path.resolve(__dirname, "./src/shared/utils"),
      "@/logging": path.resolve(__dirname, "./src/shared/utils/logger.ts"),
      "@/workers": path.resolve(__dirname, "./src/core/workers"),
      "@/app": path.resolve(__dirname, "./src/app"),
      "@/providers": path.resolve(__dirname, "./src/app/providers"),
      "@/messages": path.resolve(__dirname, "./src/shared/utils"),
    },
  },
  esbuild: {
    target: "node14", // Lower target for faster transpilation
  },
});