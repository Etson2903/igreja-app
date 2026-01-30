import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'AD Vargeão', // NOME CORRIGIDO
        short_name: 'AD Vargeão', // NOME CURTO CORRIGIDO
        description: 'Aplicativo oficial da Assembleia de Deus em Vargeão',
        theme_color: '#F59E0B', // COR ÂMBAR (Amber-500)
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: './',
        start_url: './',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      }
    })
  ],
  base: './', // Mantido para compatibilidade com APK
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});