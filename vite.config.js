import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    // Raise warning threshold (each split chunk will be well under this)
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      output: {
        // Split vendor libraries into separate cached chunks
        manualChunks(id) {
          // React core — loaded first, always needed
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          // Router
          if (id.includes('node_modules/react-router-dom/') || id.includes('node_modules/react-router/')) {
            return 'vendor-router';
          }
          // Charts library (heavy — isolate it)
          if (id.includes('node_modules/recharts')) {
            return 'vendor-charts';
          }
          // Real-time socket
          if (id.includes('node_modules/socket.io-client') || id.includes('node_modules/engine.io-client')) {
            return 'vendor-socket';
          }
          // Utility libraries
          if (id.includes('node_modules/axios') || id.includes('node_modules/date-fns') || id.includes('node_modules/clsx')) {
            return 'vendor-utils';
          }
          // Everything else in node_modules → shared vendor chunk
          if (id.includes('node_modules/')) {
            return 'vendor-misc';
          }
        },
      },
    },
  },
});
