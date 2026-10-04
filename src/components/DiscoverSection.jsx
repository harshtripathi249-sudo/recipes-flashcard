import React, { useState, useEffect, useRef } from 'react';
import RecipePhoto from './RecipePhoto';

const SAMPLE_SEARCHES = ['Shakshuka', 'Ratatouille', 'Falafel', 'Dal', 'Pancakes', 'Apple Pie'];

export default function DiscoverSection({
  savedRecipes,
  onSaveToMyRecipes,
  onViewRecipe,
  initialQuery = ''
}) {
  const [query, setQuery] = useState(initialQuery || '');
  const [activeSearch, setActiveSearch] = useState(initialQuery || '');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // AI Generation state
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiRecipe, setAiRecipe] = useState(null);
  const [aiError, setAiError] = useState(null);

  // Stale request prevention ref
  const latestSearchId = useRef(0);

  // Sync and trigger search if initialQuery is provided from Hero
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  // Perform TheMealDB search
  const performSearch = async (searchTerm) => {
    const term = searchTerm.trim();
    if (!term) return;

    const searchId = ++latestSearchId.current;
    setIsLoading(true);
    setSearchError(null);
    setHasSearched(true);
    setActiveSearch(term);
    setAiRecipe(null);
    setAiError(null);

    try {
      const res = await fetch(`/api/recipes/search?q=${encodeURIComponent(term)}`);
      
      // If a newer search was initiated, discard this stale response
      if (searchId !== latestSearchId.current) return;

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Server returned error (${res.status})`);
      }

      const data = await res.json();
      if (searchId !== latestSearchId.current) return;

      setResults(data.results || []);
    } catch (err) {
      if (searchId !== latestSearchId.current) return;
      setSearchError(err.message || 'Failed to search online recipes.');
      setResults([]);
    } finally {
      if (searchId === latestSearchId.current) {
        setIsLoading(false);
      }
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    performSearch(query);
  };

  const handleSampleClick = (dish) => {
    setQuery(dish);
    performSearch(dish);
  };

  // Perform AI Generation with Gemini
  const handleGenerateAi = async (dishToGenerate) => {
    const targetDish = (dishToGenerate || activeSearch || query).trim();
    if (!targetDish) return;

    setIsGeneratingAi(true);
    setAiError(null);

    try {
      const res = await fetch('/api/recipes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dishName: targetDish, preference: 'vegetarian' })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'API_KEY_MISSING') {
          throw new Error('Gemini API key is not configured on the server. Please add your GEMINI_API_KEY to your .env file.');
        }
        throw new Error(data.message || 'AI recipe generation failed.');
      }

      if (!data.recipe) {
        throw new Error('Received invalid recipe data from AI service.');
      }

      setAiRecipe(data.recipe);
    } catch (err) {
      setAiError(err.message || 'Could not generate AI recipe.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Check if a recipe is already saved in My Recipes (by title or ID)
  const isRecipeSaved = (recipe) => {
    return savedRecipes.some(
      (r) => r.id === recipe.id || r.title.toLowerCase() === recipe.title.toLowerCase()
    );
  };

  return (
    <div className="discover-section" id="discover-area">
      {/* Search Header Banner */}
      <div className="discover-header-card">
        <div className="discover-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
          </svg>
          <span>Online Recipe Discovery</span>
        </div>

        <h2 className="discover-title">Explore Global Recipes</h2>
        <p className="discover-subtitle">
          Search TheMealDB by dish name. If nothing suitable turns up, you can ask Gemini to write a recipe. Online results stay here until you save them to My Recipes.
        </p>

        {/* Discovery Search Form */}
        <form onSubmit={handleFormSubmit} className="discover-search-form" role="search">
          <div className="discover-input-wrap">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              className="discover-input"
              placeholder="Dish name, e.g. Shakshuka, Ratatouille, Dal"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search dishes online"
            />
            {query && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setQuery('')}
                aria-label="Clear discover search"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary discover-search-btn"
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? (
              <>
                <span className="spinner-sm" aria-hidden="true"></span>
                <span>Searching...</span>
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <span>Search Dishes</span>
              </>
            )}
          </button>
        </form>

        {/* Popular Dish Inspiration Tags */}
        <div className="sample-tags-row">
          <span className="sample-label">Try searching:</span>
          {SAMPLE_SEARCHES.map((dish) => (
            <button
              key={dish}
              type="button"
              className="sample-pill-btn"
              onClick={() => handleSampleClick(dish)}
            >
              {dish}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="discover-loading-container" role="status" aria-live="polite">
          <div className="spinner-large" aria-hidden="true"></div>
          <p className="loading-text">Searching recipe database for &ldquo;{activeSearch}&rdquo;...</p>
        </div>
      )}

      {/* Upstream Error with Retry State */}
      {searchError && !isLoading && (
        <div className="discover-error-banner" role="alert">
          <div className="error-icon-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D9381E" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div className="error-details">
            <h4>Recipe Search Unavailable</h4>
            <p>{searchError}</p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => performSearch(activeSearch)}
          >
            Retry Search
          </button>
        </div>
      )}

      {/* AI Generation State Box (if AI recipe was generated) */}
      {aiRecipe && (
        <div className="ai-recipe-showcase">
          <div className="ai-showcase-header">
            <div className="ai-badge-prominent">
              <span>AI-generated recipe</span>
            </div>
            <span className="ai-disclaimer-pill">Written by Gemini. Not verified or tested.</span>
          </div>

          <div className="ai-recipe-card-wrapper">
            <div className="ai-card-content">
              <h3>{aiRecipe.title}</h3>
              <p className="ai-card-desc">{aiRecipe.description}</p>
              <div className="ai-card-meta">
                {[
                  aiRecipe.prepTime && `Prep ${aiRecipe.prepTime}`,
                  aiRecipe.cookTime && `Cook ${aiRecipe.cookTime}`,
                  aiRecipe.servings && `Serves ${aiRecipe.servings}`,
                  aiRecipe.category
                ].filter(Boolean).map((item, i) => (
                  <span key={item}>{i > 0 ? '· ' : ''}{item}</span>
                ))}
              </div>
            </div>

            <div className="ai-card-actions">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => onViewRecipe(aiRecipe)}
              >
                View Full Recipe
              </button>

              <button
                type="button"
                className={`btn ${isRecipeSaved(aiRecipe) ? 'btn-secondary' : 'btn-accent'}`}
                disabled={isRecipeSaved(aiRecipe)}
                onClick={() => onSaveToMyRecipes(aiRecipe)}
              >
                {isRecipeSaved(aiRecipe) ? '✓ Saved in My Recipes' : '+ Save to My Recipes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Error Box */}
      {aiError && (
        <div className="ai-error-banner" role="alert">
          <div className="error-details">
            <h4>AI Recipe Generation</h4>
            <p>{aiError}</p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => handleGenerateAi(activeSearch || query)}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Database Search Results Grid */}
      {!isLoading && results.length > 0 && (
        <div className="discover-results-area">
          <div className="results-header-row">
            <h3>From TheMealDB ({results.length})</h3>
            <button
              type="button"
              className="btn-link-ai"
              onClick={() => handleGenerateAi(activeSearch)}
              disabled={isGeneratingAi}
            >
              {isGeneratingAi ? 'Generating AI recipe…' : 'Not what you wanted? Ask Gemini to write one'}
            </button>
          </div>

          <div className="recipes-grid">
            {results.map((dish) => {
              const alreadySaved = isRecipeSaved(dish);
              return (
                <div key={dish.id} className="recipe-card discover-card">
                  {/* Media */}
                  <div className="card-media-wrapper" onClick={() => onViewRecipe(dish)}>
                    <RecipePhoto
                      src={dish.image}
                      alt={dish.alt || dish.title}
                      label={dish.cuisine || dish.category}
                      className="card-image"
                    />
                    <span className="card-category-badge">{dish.mealDbCategory || dish.category}</span>
                  </div>

                  {/* Body */}
                  <div className="card-content">
                    <h3 className="card-title" onClick={() => onViewRecipe(dish)}>
                      {dish.title}
                    </h3>
                    {dish.cuisine && <p className="card-description">{dish.cuisine} cuisine</p>}

                    <p className="source-line">
                      Recipe and photo:{' '}
                      <a href={dish.mealDbUrl} target="_blank" rel="noopener noreferrer">TheMealDB</a>
                      {dish.sourceUrl && dish.sourceUrl !== dish.mealDbUrl && (
                        <>
                          {' · '}
                          <a href={dish.sourceUrl} target="_blank" rel="noopener noreferrer">
                            Original source<span className="sr-only"> for {dish.title}</span> ↗
                          </a>
                        </>
                      )}
                    </p>

                    {/* Discover Actions */}
                    <div className="discover-card-actions">
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => onViewRecipe(dish)}
                      >
                        View Details
                      </button>

                      <button
                        type="button"
                        className={`btn btn-sm ${alreadySaved ? 'btn-secondary' : 'btn-accent'}`}
                        disabled={alreadySaved}
                        onClick={() => onSaveToMyRecipes(dish)}
                        aria-label={alreadySaved ? `${dish.title} is already saved in My Recipes` : `Save ${dish.title} to My Recipes`}
                      >
                        {alreadySaved ? '✓ Saved' : '+ Save'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Results from Database -> Offer AI Generation Fallback */}
      {!isLoading && hasSearched && results.length === 0 && !searchError && !aiRecipe && (
        <div className="discover-empty-state">
          <div className="empty-icon-wrap" aria-hidden="true">
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#8C827A" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </div>

          <h3>Nothing found for &ldquo;{activeSearch}&rdquo;</h3>
          <p>
            TheMealDB has no entry with this name. You can try a different spelling, or ask Gemini to write a recipe.
          </p>

          <div className="ai-fallback-box">
            <div className="ai-fallback-info">
              <span className="ai-chip">AI recipe</span>
              <h4>Generate &ldquo;{activeSearch}&rdquo; with AI</h4>
              <p className="ai-disclaimer-text">
                Gemini writes the recipe from the dish name. It is labelled AI-generated and has not been verified or tested.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-lg"
              disabled={isGeneratingAi}
              onClick={() => handleGenerateAi(activeSearch)}
            >
              {isGeneratingAi ? (
                <>
                  <span className="spinner-sm" aria-hidden="true"></span>
                  <span>Formulating Recipe...</span>
                </>
              ) : (
                <>
                  <span>Generate with Gemini AI</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Initial Landing Exploration State */}
      {!hasSearched && (
        <div className="discover-welcome-panel">
          <div className="welcome-feature-card">
            <h4>Search TheMealDB</h4>
            <p>Look up a dish by name. Each result links back to TheMealDB and, when available, the original recipe.</p>
          </div>

          <div className="welcome-feature-card">
            <h4>Ask Gemini if you need to</h4>
            <p>If nothing matches, you can have Gemini write a recipe. It is always labelled AI-generated and is not verified or tested.</p>
          </div>

          <div className="welcome-feature-card">
            <h4>Save what you like</h4>
            <p>Results stay separate until you save them. Saved recipes go to My Recipes, where you can edit notes and tick off ingredients.</p>
          </div>
        </div>
      )}
    </div>
  );
}
