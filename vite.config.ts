import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), pwa()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});

/** Configuration for PWA service worker */
function pwa() {
  return VitePWA({
    strategies: 'generateSW',
    registerType: 'autoUpdate',
    includeAssets: ['*.wasm', '*.js', '*.png'],
    workbox: {
      maximumFileSizeToCacheInBytes: 10485760, // increasing the file size to cached 10mb
      globPatterns: ['**/*.{svg,png,css,html}', 'assets/index*.js', '*.js', '*.wasm'],
    },

    // Assets and manifest options generated using
    // https://favicon.inbrowser.app/tools/favicon-generator
    manifest: {
      name: 'Ownly Workspace',
      short_name: 'Ownly',
      icons: [
        {
          src: '/icons/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/icons/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/icons/pwa-maskable-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable',
        },
        {
          src: '/icons/pwa-maskable-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
      start_url: '/',
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#673ab7',
      theme_color: '#673ab7',
      description: 'A workspace you own',
    },
  });
}
