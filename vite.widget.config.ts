import { defineConfig } from 'vite';
import { resolve } from 'path';

// Widget-specific build configuration
export default defineConfig({
  base: './',
  build: {
    lib: {
      entry: resolve(__dirname, 'src/widget.ts'),
      name: 'SinoForm',
      fileName: 'sino-form-widget',
      formats: ['iife']
    },
    rollupOptions: {
      output: {
        // Ensure single file output
        inlineDynamicImports: true,
        manualChunks: undefined,
      }
    },
    // Minify for production
    minify: 'terser',
    // Single file output
    outDir: 'dist',
    emptyOutDir: false,
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});
