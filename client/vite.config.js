import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/walkins': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/call-logs': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/calls': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/schedules': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/schedule': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/staff': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/daily-activities': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
