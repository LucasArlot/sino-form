import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        embed: resolve(__dirname, 'embed.html'),
        widget: resolve(__dirname, 'src/widget.ts'),
        'widget-app': resolve(__dirname, 'widget.html'),
        'widget-inline': resolve(__dirname, 'src/widget-inline.ts'),
      },
      output: {
        manualChunks: (id) => {
          // Regular chunking for main and embed builds
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'ui-icons';
            }
          }
          if (
            id.includes('@/features/lead/context/i18n') ||
            id.includes('@/features/lead/context/ports') ||
            id.includes('@/features/lead/context/types')
          ) {
            return 'lead-context';
          }
          if (id.includes('@/features/lead/context/QuoteFormContext')) {
            return 'quote-form-context';
          }
        },
        // Widget-specific output configuration
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'widget') {
            return 'sino-form-widget.js';
          }
          if (chunkInfo.name === 'widget-inline') {
            return 'sino-form-inline.js';
          }
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'widget') {
            return 'sino-form-widget.js';
          }
          if (chunkInfo.name === 'widget-inline') {
            return 'sino-form-inline.js';
          }
          return 'assets/[name]-[hash].js';
        },
        format: 'es',
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    host: true, // Expose dev server on local network (0.0.0.0)
    port: 5173,
    strictPort: true,
    hmr: {
      overlay: false, // Disable error overlay to prevent reload issues
    },
    proxy: {
      '/api/n8n-test': {
        target:
          'https://n8n.srv783609.hstgr.cloud/webhook-test/228cb671-34ad-4e2e-95ab-95d830d875df',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/n8n-test/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Access-Control-Allow-Origin', '*');
            proxyReq.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            proxyReq.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
          });
        },
      },
      '/api/n8n-prod': {
        target: 'https://n8n.srv783609.hstgr.cloud/webhook/228cb671-34ad-4e2e-95ab-95d830d875df',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/n8n-prod/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Access-Control-Allow-Origin', '*');
            proxyReq.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            proxyReq.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
          });
        },
      },
    },
  },
});
