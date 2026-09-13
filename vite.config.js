import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { handleCentralizedApi } from './src/server/centralizedServer.js';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'centralized-api-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url && req.url.startsWith('/api')) {
            try {
              const handled = await handleCentralizedApi(req, res);
              if (handled) return;
            } catch (err) {
              console.error('[Vite API Middleware Error]', err);
            }
          }
          next();
        });
      }
    }
  ],
  server: {
    port: 5174,
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5050',
        changeOrigin: true,
        ws: true
      }
    }
  }
});


