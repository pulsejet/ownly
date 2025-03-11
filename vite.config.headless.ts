import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    lib: {
      name: 'headless',
      entry: ['src/node/headless.ts'],
      formats: ['es'],
    },
    minify: false,
    rollupOptions: {
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src/node',
      },
      external: [
        /node:.*/,
        'fs',
        'fs/promises',
        'worker_threads',
        'buffer',
        'util',
        'crypto',
        'path',
      ],
    },
  },
});
