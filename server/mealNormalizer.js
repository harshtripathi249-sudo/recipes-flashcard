/**
 * Normalizes a TheMealDB meal into Savoria's recipe shape.
 * Only real data is mapped. TheMealDB has no prep time, cook time, servings or
 * difficulty, so those fields are left out rather than invented.
 */

const MEALDB_SITE = 'https://www.themealdb.com';

// TheMealDB categories -> Savoria's cookbook categories (used for filter pills)
const CATEGORY_MAP = {
  Pasta: 'Artisanal Pastas',
  Dessert: 'Seasonal Desserts',
  Breakfast: 'Breakfast & Pastries'
};

export function mapCategory(mealDbCategory) {
  return CATEGORY_MAP[mealDbCategory] || 'Gourmet Mains';
}

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function normalizeMeal(meal) {
  const rawIngredients = [];
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = (meal[`strIngredient${i}`] || '').trim();
    const measure = (meal[`strMeasure${i}`] || '').trim();
    if (ing) {
      rawIngredients.push(ing);
      ingredients.push(measure ? `${measure} ${ing}` : ing);
    }
  }

  const rawInstructions = meal.strInstructions || '';
  const instructions = rawInstructions
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !/^STEP \d+$/i.test(line));

  const mealDbUrl = `${MEALDB_SITE}/meal/${meal.idMeal}`;
  const originalHost = hostOf(meal.strSource);
  const area = meal.strArea && meal.strArea !== 'Unknown' && meal.strArea !== 'None' ? meal.strArea : '';

  const lead = rawIngredients.slice(0, 3).map((s) => s.toLowerCase());
  const description = lead.length
    ? `Made with ${lead.join(', ')}${rawIngredients.length > 3 ? ' and more' : ''}.`
    : '';

  return {
    id: `mealdb-${meal.idMeal}`,
    title: meal.strMeal,
    category: mapCategory(meal.strCategory),
    mealDbCategory: meal.strCategory || '',
    cuisine: area,
    image: meal.strMealThumb || '',
    alt: `Photograph of ${meal.strMeal}`,
    imageCredit: 'Photo: TheMealDB',
    description,
    ingredients: ingredients.length > 0 ? ingredients : ['See instructions'],
    instructions: instructions.length > 0 ? instructions : [rawInstructions].filter(Boolean),
    notes: '',
    tags: meal.strTags ? meal.strTags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    // Link to the original publisher when TheMealDB has one; otherwise to the TheMealDB entry.
    sourceUrl: meal.strSource || mealDbUrl,
    mealDbUrl,
    youtubeUrl: meal.strYoutube || '',
    sourceAttribution: originalHost ? `TheMealDB (original: ${originalHost})` : 'TheMealDB',
    isAiGenerated: false
  };
}
