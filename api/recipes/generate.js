/**
 * Vercel Serverless Function: POST /api/recipes/generate
 * Generates custom structured recipe using Gemini AI.
 * Secrets are securely accessed via process.env.GEMINI_API_KEY.
 */

import { handleGeminiGenerate } from '../../server/apiHandler.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' });
  }

  try {
    await handleGeminiGenerate(req, res, process.env);
  } catch (err) {
    console.error('[Vercel Function Error: Generate]:', err);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to generate recipe with AI.' });
  }
}
