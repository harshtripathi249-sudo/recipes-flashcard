/**
 * Vercel Serverless Function: GET /api/recipes/search?q=...
 * Proxies TheMealDB search and normalizes recipe data.
 */

import { handleTheMealDbSearch } from '../../server/apiHandler.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' });
  }

  try {
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const parsedUrl = new URL(req.url, `${protocol}://${host}`);

    await handleTheMealDbSearch(req, res, parsedUrl);
  } catch (err) {
    console.error('[Vercel Function Error: Search]:', err);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to search recipes.' });
  }
}
