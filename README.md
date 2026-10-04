# Savoria — Curated Recipe Studio & Kitchen Journal

Savoria is an interactive, responsive recipe collection and discovery application built with **React 19**, **Vite 8**, and a pure **Vanilla CSS** design system.

---

## Features

1. **Personal Cookbook (My Recipes)**:
   - Full CRUD: Create, read, edit, and delete recipes with safety confirmation dialogs.
   - Interactive cooking view: check off ingredients while gathering them in the kitchen.
   - Category filtering (Gourmet Mains, Grain Bowls, Artisanal Pastas, Breakfast & Pastries, Seasonal Desserts).
   - Local search matching titles, descriptions, categories, and ingredients.
   - Favorites management and customizable sorting (Recently Added, Cook Time, Alphabetical, Servings).
   - Local storage persistence.

2. **Online Recipe Discovery (Discover Recipes)**:
   - Query global dishes from **TheMealDB** by name (e.g. *Arrabiata, Pancakes, Minestrone, Dal*).
   - Clean normalization of ingredients, measures, instruction steps, image thumbnails, and source attribution.
   - **Gemini AI Recipe Generation**: When a dish is not in the database or when requested, Gemini AI formulates a structured recipe with step-by-step instructions and practical kitchen tips.
   - Distinct "AI-Generated" labeling and culinary disclaimers.
   - **One-Click Save to My Recipes**: Saves discovered recipes into your personal collection with automatic duplicate prevention and source attribution.

---

## Getting Started

### 1. Installation
Install project dependencies:
```bash
npm install
```

### 2. Configure Environment (Optional for AI Generation)
Copy the example environment file:
```bash
copy .env.example .env
```
Open `.env` and add your Google Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
> **Note**: Obtain a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey).
> Secrets are strictly loaded on the server side via Vite's middleware and never exposed to client-side code.

### 3. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173/`.

### 4. Build for Production
```bash
npm run build
```

---

## API Architecture & Free-Tier Limitations

### 1. TheMealDB API
- **Endpoint**: `https://www.themealdb.com/api/json/v1/1/`
- **Key**: Uses the documented public test key `1` for development.
- **Limitations**: The public test key is intended for testing and development. It provides access to thousands of standard dishes and ingredients, but does not provide advanced filters or commercial SLA guarantees.

### 2. Google Gemini API
- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`
- **Limitations**: Free-tier Gemini keys have rate limits (typically 15 RPM / 1 million TPM). The application includes a 15-second request timeout, graceful rate-limit detection (HTTP 429), and user-friendly error banners with retry buttons.
