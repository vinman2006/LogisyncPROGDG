import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { createNeonApiMiddleware } from './server/apiMiddleware.js';

function neonApiPlugin() {
  return {
    name: 'neon-api-middleware',
    configureServer(server) {
      server.middlewares.use(createNeonApiMiddleware());
    },
    configurePreviewServer(server) {
      server.middlewares.use(createNeonApiMiddleware());
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), neonApiPlugin()],
});
