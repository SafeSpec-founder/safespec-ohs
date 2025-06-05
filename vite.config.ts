import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
<<<<<<< HEAD
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
=======
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';
>>>>>>> 9ea5b5e1357355eaa44297a121431e4c6c5f64d4

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
<<<<<<< HEAD
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'SafeSpec OHS Application',
        short_name: 'SafeSpec',
        description: 'Occupational Health and Safety Management System',
=======
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'SafeSpec OHS Suite',
        short_name: 'SafeSpec',
        description: 'Occupational Health & Safety Management Platform',
>>>>>>> 9ea5b5e1357355eaa44297a121431e4c6c5f64d4
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
<<<<<<< HEAD
            type: 'image/png',
=======
            type: 'image/png'
>>>>>>> 9ea5b5e1357355eaa44297a121431e4c6c5f64d4
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
<<<<<<< HEAD
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.safespec\.com\/v1/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
        ],
      },
    }),
=======
            type: 'image/png'
          }
        ]
      }
    })
>>>>>>> 9ea5b5e1357355eaa44297a121431e4c6c5f64d4
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
<<<<<<< HEAD
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@ai': path.resolve(__dirname, './src/ai'),
      '@automation': path.resolve(__dirname, './src/automation'),
      '@offline': path.resolve(__dirname, './src/offline'),
      '@store': path.resolve(__dirname, './src/store'),
      '@models': path.resolve(__dirname, './src/models'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@router': path.resolve(__dirname, './src/router'),
      '@layouts': path.resolve(__dirname, './src/layouts'),
=======
>>>>>>> 9ea5b5e1357355eaa44297a121431e4c6c5f64d4
    },
  },
  server: {
    port: 3000,
<<<<<<< HEAD
    proxy: {
      '/api': {
        target: 'https://api.safespec.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/v1'),
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV !== 'production',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          charts: ['chart.js', 'react-chartjs-2'],
          pdf: ['pdfjs-dist', 'react-pdf'],
        },
      },
    },
  },
=======
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
>>>>>>> 9ea5b5e1357355eaa44297a121431e4c6c5f64d4
});
