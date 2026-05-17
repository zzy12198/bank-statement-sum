import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.png'],
      manifest: {
        name: '银行流水图片金额自动汇总',
        short_name: '流水汇总',
        description: '在本地浏览器识别银行流水图片金额，辅助汇总收入、支出和净额。',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#f8fafc',
        theme_color: '#0f766e',
        icons: [
          {
            src: '/icon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest,json,wasm}'],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024
      },
      devOptions: {
        enabled: true
      }
    })
  ]
});
