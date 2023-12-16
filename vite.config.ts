/// <reference types="vitest" />
/// <reference types="vite/client" />

import { default as react } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Somehow TypeScript is saying react is not callable
    react(),
  ],
  test: {
    css: true,
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
  },
});
