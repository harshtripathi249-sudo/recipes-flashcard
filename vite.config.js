import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { handleTheMealDbSearch, handleGeminiGenerate, sendJson } from './server/apiHandler.js'

function recipeApiPlugin() {
  return {
    name: 'recipe-api-plugin',
    configureServer(server) {
      const env = loadEnv(server.config.mode || 'development', process.cwd(), '');
      server.middlewares.use(async (req, res, next) => {
        try {
          const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

          if (parsedUrl.pathname === '/api/recipes/search' && req.method === 'GET') {
            await handleTheMealDbSearch(req, res, parsedUrl);
            return;
          }

          if (parsedUrl.pathname === '/api/recipes/generate' && req.method === 'POST') {
            await handleGeminiGenerate(req, res, env);
            return;
          }

          next();
        } catch (err) {
          console.error('[API Middleware Error]:', err);
          sendJson(res, 500, { error: 'INTERNAL_ERROR', message: err.message });
        }
      });
    },
    configurePreviewServer(server) {
      const env = loadEnv('production', process.cwd(), '');
      server.middlewares.use(async (req, res, next) => {
        try {
          const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

          if (parsedUrl.pathname === '/api/recipes/search' && req.method === 'GET') {
            await handleTheMealDbSearch(req, res, parsedUrl);
            return;
          }

          if (parsedUrl.pathname === '/api/recipes/generate' && req.method === 'POST') {
            await handleGeminiGenerate(req, res, env);
            return;
          }

          next();
        } catch (err) {
          console.error('[API Preview Error]:', err);
          sendJson(res, 500, { error: 'INTERNAL_ERROR', message: err.message });
        }
      });
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    recipeApiPlugin()
  ],
})
