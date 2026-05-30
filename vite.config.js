import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const useProxy = env.VITE_USE_PROXY === 'true';
  const apiTarget = env.VITE_API_BASE_URL || 'https://bancocentroamericano.azurewebsites.net/api';
  // El proxy debe apuntar al host raíz; la ruta /api se reenvía tal cual
  const proxyOrigin = apiTarget.replace(/\/api\/?$/, '');

  return {
    plugins: [react()],
    server: {
      port: 5173,
      open: true,
      proxy: useProxy
        ? {
            '/api': {
              target: proxyOrigin,
              changeOrigin: true,
              secure: false,
            },
          }
        : undefined,
    },
    build: {
      target: 'es2020',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            charts: ['chart.js', 'react-chartjs-2'],
            motion: ['framer-motion'],
          },
        },
      },
    },
  };
});
