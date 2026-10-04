/**
 * Savoria Recipe Book - Server-side API Handler
 * Handles TheMealDB search and Gemini AI recipe generation securely.
 * Keeps all external API keys strictly on the server side.
 */

import fs from 'node:fs';
import path from 'node:path';
import { normalizeMeal } from './mealNormalizer.js';

// Helper to extract Gemini API key from multiple locations
function getGeminiApiKey(env) {
  // 1. Direct env argument
  if (env?.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() && env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    return env.GEMINI_API_KEY.trim();
  }
  // 2. process.env
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    return process.env.GEMINI_API_KEY.trim();
  }
  // 3. Read .env / .env.local / .env.example files from disk
  const envPaths = ['.env', '.env.local', '.env.example'];
  for (const file of envPaths) {
    try {
      const fullPath = path.resolve(process.cwd(), file);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        for (const line of content.split('\n')) {
          const match = line.match(/^\s*GEMINI_API_KEY\s*=\s*(.+?)\s*$/);
          if (match && match[1] && match[1].trim() && match[1].trim() !== 'your_gemini_api_key_here') {
            return match[1].trim();
          }
        }
      }
    } catch {}
  }
  return null;
}

// Helper to parse JSON body from incoming Node request or Vercel Serverless Function
export function readBody(req) {
  if (req.body && typeof req.body === 'object') {
    return Promise.resolve(req.body);
  }
  if (typeof req.body === 'string') {
    try {
      return Promise.resolve(JSON.parse(req.body));
    } catch {
      return Promise.reject(new Error('Invalid JSON'));
    }
  }

  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Payload Too Large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

// Helper to send JSON responses (compatible with both Node http.ServerResponse and Vercel response helper)
export function sendJson(res, statusCode, data) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(data);
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(data));
}

/**
 * Handle GET /api/recipes/search?q=query
 * Queries TheMealDB official API and normalizes results.
 */
export async function handleTheMealDbSearch(req, res, url) {
  const query = (url.searchParams.get('q') || '').trim();

  if (!query) {
    return sendJson(res, 400, {
      error: 'INVALID_QUERY',
      message: 'Search query parameter "q" is required.'
    });
  }

  const endpoint = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const response = await fetch(endpoint, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`TheMealDB responded with status ${response.status}`);
    }

    const data = await response.json();

    if (!data.meals || !Array.isArray(data.meals)) {
      return sendJson(res, 200, {
        source: 'themealdb',
        query,
        count: 0,
        results: []
      });
    }

    const normalized = data.meals.map(normalizeMeal);

    return sendJson(res, 200, {
      source: 'themealdb',
      query,
      count: normalized.length,
      results: normalized
    });
  } catch (err) {
    const isTimeout = err.name === 'AbortError';
    return sendJson(res, isTimeout ? 504 : 502, {
      error: isTimeout ? 'TIMEOUT' : 'UPSTREAM_ERROR',
      message: isTimeout
        ? 'The request to TheMealDB timed out. Please try again.'
        : `Could not reach recipe database: ${err.message}`,
      retryable: true
    });
  }
}

/**
 * Handle POST /api/recipes/generate
 * Uses the Google Gemini API with structured JSON output and schema validation.
 */
export async function handleGeminiGenerate(req, res, env) {
  const apiKey = getGeminiApiKey(env);

  if (!apiKey) {
    return sendJson(res, 503, {
      error: 'API_KEY_MISSING',
      message: 'Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file.',
      setupHelp: 'Add GEMINI_API_KEY=your_key in .env and restart the dev server.'
    });
  }

  let body;
  try {
    body = await readBody(req);
  } catch (err) {
    return sendJson(res, 400, { error: 'INVALID_BODY', message: err.message });
  }

  const dishName = (body.dishName || '').trim();
  const dietaryPreference = (body.preference || 'vegetarian').trim();

  if (!dishName) {
    return sendJson(res, 400, {
      error: 'MISSING_DISH_NAME',
      message: 'Please provide a dish name to generate.'
    });
  }

  const prompt = `You are a culinary expert assistant creating a structured recipe for "${dishName}" (${dietaryPreference}).
Return ONLY a valid JSON object matching this exact schema:
{
  "title": "Clear recipe title",
  "description": "A concise 2-sentence culinary overview of flavor profile and texture.",
  "category": "Gourmet Mains",
  "prepTime": "15 mins",
  "cookTime": "25 mins",
  "servings": 4,
  "difficulty": "Easy",
  "ingredients": [
    "quantity and ingredient (e.g. 250g paneer cubes)"
  ],
  "instructions": [
    "Clear numbered cooking step 1",
    "Clear numbered cooking step 2"
  ],
  "notes": "One practical kitchen tip or technique."
}

Rules:
1. Category must be one of: "Gourmet Mains", "Grain Bowls", "Artisanal Pastas", "Breakfast & Pastries", "Seasonal Desserts", "Quick & Easy".
2. Difficulty must be one of: "Easy", "Intermediate", "Advanced".
3. All ingredients and instructions must be practical and realistic.
4. Do NOT invent nutrition facts or make unsubstantiated health claims.
5. Output MUST be 100% valid JSON with no markdown backticks, no markdown fencing, and no conversational preamble.`;

  // Use active models supported by the Gemini API endpoint
  const candidateModels = ['gemini-flash-latest', 'gemini-3.5-flash-lite', 'gemini-3.8-flash'];
  let lastError = null;

  for (const modelName of candidateModels) {
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const geminiRes = await fetch(geminiEndpoint, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json'
          }
        })
      });
      clearTimeout(timeoutId);

      if (!geminiRes.ok) {
        const errText = await geminiRes.text();
        let parsedErr = {};
        try { parsedErr = JSON.parse(errText); } catch {}
        
        // If 404 (model not found) or 503 (high demand spike), try next candidate model
        if (geminiRes.status === 404 || geminiRes.status === 503) {
          lastError = parsedErr.error?.message || `Status ${geminiRes.status}`;
          continue;
        }

        console.error('[Gemini] upstream status', geminiRes.status, parsedErr.error?.message || '');
        return sendJson(res, geminiRes.status === 429 ? 429 : 502, {
          error: geminiRes.status === 429 ? 'RATE_LIMIT_EXCEEDED' : 'GEMINI_ERROR',
          message: geminiRes.status === 429
            ? 'The AI service is rate-limited right now. Please wait a moment and retry.'
            : 'The AI service returned an error. Please try again.',
          retryable: true
        });
      }

      const data = await geminiRes.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error('No content returned from Gemini');
      }

      const cleanedText = rawText.replace(/```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsedRecipe = JSON.parse(cleanedText);

      // Schema validation
      if (!parsedRecipe.title || !Array.isArray(parsedRecipe.ingredients) || !Array.isArray(parsedRecipe.instructions)) {
        throw new Error('Generated recipe did not match expected structure');
      }

      const recipe = {
        id: `ai-${Date.now()}`,
        title: parsedRecipe.title,
        description: parsedRecipe.description || '',
        category: parsedRecipe.category || 'Gourmet Mains',
        prepTime: parsedRecipe.prepTime || '15 mins',
        cookTime: parsedRecipe.cookTime || '25 mins',
        servings: Number(parsedRecipe.servings) || 4,
        difficulty: parsedRecipe.difficulty || 'Easy',
        image: '',
        alt: '',
        ingredients: parsedRecipe.ingredients.filter(Boolean),
        instructions: parsedRecipe.instructions.filter(Boolean),
        notes: parsedRecipe.notes ? `${parsedRecipe.notes}` : '',
        sourceUrl: '',
        sourceAttribution: 'Gemini AI',
        isAiGenerated: true
      };

      return sendJson(res, 200, {
        source: 'gemini',
        recipe
      });
    } catch (err) {
      lastError = err.message;
      if (err.name === 'AbortError') {
        return sendJson(res, 504, {
          error: 'TIMEOUT',
          message: 'AI generation timed out. Please try again.',
          retryable: true
        });
      }
    }
  }

  // If all models failed
  console.error('[Gemini] generation failed:', lastError);
  return sendJson(res, 500, {
    error: 'GENERATION_FAILED',
    message: 'Could not generate a recipe right now. Please try again.',
    retryable: true
  });
}
