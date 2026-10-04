/**
 * Production server: serves the built app from dist/ and exposes the same
 * /api routes the Vite dev server provides. Secrets are read from the
 * environment (GEMINI_API_KEY) on the server only.
 *
 * Usage: npm run build && npm start
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleTheMealDbSearch, handleGeminiGenerate, sendJson } from './apiHandler.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const port = Number(process.env.PORT) || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    if (url.pathname === '/api/recipes/search' && req.method === 'GET') {
      return await handleTheMealDbSearch(req, res, url);
    }
    if (url.pathname === '/api/recipes/generate' && req.method === 'POST') {
      return await handleGeminiGenerate(req, res, process.env);
    }

    // Static files, falling back to index.html (single-page app)
    const requested = path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
    let filePath = path.join(root, requested);
    if (!filePath.startsWith(root + path.sep) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(root, 'index.html');
    }
    res.setHeader('Content-Type', MIME[path.extname(filePath)] || 'application/octet-stream');
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error('[Server Error]:', err);
    sendJson(res, 500, { error: 'INTERNAL_ERROR', message: 'Something went wrong.' });
  }
});

server.listen(port, () => console.log(`Savoria running on http://localhost:${port}`));
