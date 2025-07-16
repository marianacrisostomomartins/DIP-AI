import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    fs: {
      allow: ['.'],
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router', 'react-router-dom'],
          'pdf-core': ['jspdf'],
          'canvas-utils': ['html2canvas'],
          icons: ['lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
});