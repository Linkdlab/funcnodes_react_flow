import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.js';

// Call the function exported by vite.config.js to get the config object
const viteConfigObject = viteConfig({ mode: 'test', command: 'serve' });

export default mergeConfig(
  viteConfigObject,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
      css: true,
    },
  })
); 