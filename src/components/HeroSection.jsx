import React, { useState } from 'react';

// Curated interactive ingredient metadata for the centerpiece dish
const INGREDIENT_CHIPS = [
  {
    id: 'saffron',
    name: 'Kashmiri Saffron',
    icon: '✨',
    positionClass: 'chip-top-left',
    note: 'Steeped golden threads imparting floral warmth and brilliant color.'
  },
  {
    id: 'porcini',
    name: 'Wild Porcini',
    icon: '🍄',
    positionClass: 'chip-top-right',
    note: 'Pan-caramelized in European butter for deep earthy umami.'
  },
  {
    id: 'rice',
    name: 'Carnaroli Rice',
    icon: '🌾',
    positionClass: 'chip-bottom-left',
    note: 'Slow-simmered all’onda to achieve a silky, velvety texture.'
  },
  {
    id: 'sage',
    name: 'Crispy Sage',
    icon: '🌿',
    positionClass: 'chip-bottom-right',
    note: 'Flash-fried in brown butter for an aromatic herbal crunch.'
  },
  {
    id: 'parmesan',
    name: 'Aged Parmigiano',
    icon: '🧀',
    positionClass: 'chip-bottom-center',
    note: '24-month aged microplane shavings beaten in off the heat.'
  }
];

const CUISINE_QUICK_FILTERS = [
  { id: 'All', label: 'All Recipes', icon: '🍽' },
  { id: 'Artisanal Pastas', label: 'Artisanal Pastas', icon: '🍝' },
  { id: 'Grain Bowls', label: 'Grain Bowls', icon: '🥗' },
  { id: 'Gourmet Mains', label: 'Gourmet Mains', icon: '🔥' },
  { id: 'Breakfast & Pastries', label: 'Breakfast & Pastries', icon: '🥐' },
  { id: 'Seasonal Desserts', label: 'Seasonal Desserts', icon: '🥧' }
];

export default function HeroSection({
  onSearch,
  onExplore,
  onDiscover,
  onAddRecipe,
  onFeaturedClick,
  onViewRecipe,
  onCategorySelect,
  savedCount = 6,
  previewRecipes = []
}) {
  const [heroSearchInput, setHeroSearchInput] = useState('');
  const [activeChip, setActiveChip] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  // Submit search query directly to discovery
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (heroSearchInput.trim()) {
      onSearch(heroSearchInput.trim());
    } else {
      onDiscover();
    }
  };

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  const handleChipClick = (chip) => {
    setActiveChip(activeChip?.id === chip.id ? null : chip);
  };

  return (
    <section className="hero-smart-section" aria-labelledby="hero-heading">
      {/* Soft Ambient Background Lighting */}
      <div className="hero-smart-bg-glow" aria-hidden="true"></div>

      <div className="hero-smart-container">
        {/* 1. Header & Value Proposition */}
        <header className="hero-header-block">
          <div className="hero-badge-pill">
            <span className="badge-pulse-dot" aria-hidden="true"></span>
            <span>Mindful Vegetarian Kitchen Studio</span>
          </div>

          <h1 id="hero-heading" className="hero-smart-headline">
            What shall we cook today?
          </h1>

          <p className="hero-smart-lead">
            Discover thousands of global vegetarian recipes from TheMealDB, compose custom creations with Gemini AI, or curate your private family cookbook.
          </p>
        </header>

        {/* 2. Interactive Discovery Command Bar (Omnibar) */}
        <div className="hero-command-bar-wrapper">
          <form 
            onSubmit={handleSearchSubmit} 
            className="hero-command-form"
            role="search"
            aria-label="Find recipes"
          >
            <div className="command-input-container">
              <svg 
                className="command-search-icon" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>

              <input
                type="text"
                className="hero-command-input"
                placeholder="Search dish by name, e.g. Saffron Risotto, Ravioli, Dal, Shakshuka..."
                value={heroSearchInput}
                onChange={(e) => setHeroSearchInput(e.target.value)}
                aria-label="Search recipes online"
                id="hero-search-input"
              />

              {heroSearchInput && (
                <button
                  type="button"
                  className="command-clear-btn"
                  onClick={() => setHeroSearchInput('')}
                  aria-label="Clear search input"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>

            <div className="command-action-buttons">
              <button 
                type="submit" 
                className="btn btn-primary command-submit-btn"
                id="hero-command-search-btn"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                </svg>
                <span>Discover Recipes</span>
              </button>
            </div>
          </form>

          {/* Quick-Access Cuisine Category Choice Strip */}
          <div className="hero-category-strip" role="toolbar" aria-label="Cuisine and category filters">
            <span className="category-strip-label">Quick Browse:</span>
            <div className="category-pills-row">
              {CUISINE_QUICK_FILTERS.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-pill-btn ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(cat.id)}
                  aria-pressed={activeCategory === cat.id}
                >
                  <span className="pill-icon" aria-hidden="true">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Actions (Clean, keyboard-friendly, visually secondary) */}
          <div className="hero-secondary-actions-row">
            <button
              type="button"
              className="hero-secondary-link"
              onClick={onExplore}
              id="hero-link-cookbook"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              <span>Browse Saved Recipes ({savedCount})</span>
            </button>

            <span className="action-dot-separator" aria-hidden="true">•</span>

            <button
              type="button"
              className="hero-secondary-link"
              onClick={onAddRecipe}
              id="hero-link-add"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Add Personal Recipe</span>
            </button>
          </div>
        </div>

        {/* 3. Centered Focal Culinary Stage with Floating Ingredient Chips */}
        <div className="hero-stage-wrapper">
          <div className="hero-focal-stage" role="region" aria-label="Signature Dish Presentation">
            {/* Focal Dish Plate Backdrop */}
            <div className="focal-image-frame">
              <img 
                src="/images/hero-saffron-risotto.jpg" 
                alt="Creamy golden saffron arborio risotto topped with sautéed wild porcini mushrooms, crispy sage leaves, and parmesan shavings in an artisan ceramic dish"
                className="focal-dish-image"
                loading="eager"
              />
              <div className="dish-inner-gradient" aria-hidden="true"></div>

              {/* Dish Badge */}
              <div className="focal-dish-tag">
                <span className="focal-tag-icon">✨</span>
                <span>Signature Vegetarian Main</span>
              </div>
            </div>

            {/* Interactive Floating Ingredient Chips */}
            <div className="floating-chips-overlay" aria-label="Key ingredients with tasting notes">
              {INGREDIENT_CHIPS.map((chip) => {
                const isSelected = activeChip?.id === chip.id;
                return (
                  <div 
                    key={chip.id} 
                    className={`floating-chip-anchor ${chip.positionClass} ${isSelected ? 'is-active' : ''}`}
                  >
                    <button
                      type="button"
                      className="floating-chip-btn"
                      onClick={() => handleChipClick(chip)}
                      onMouseEnter={() => setActiveChip(chip)}
                      aria-expanded={isSelected}
                      title={`Click for tasting note on ${chip.name}`}
                    >
                      <span className="chip-icon" aria-hidden="true">{chip.icon}</span>
                      <span className="chip-title">{chip.name}</span>
                    </button>

                    {/* Popover Tasting Note */}
                    {isSelected && (
                      <div className="chip-popover-card" role="tooltip">
                        <div className="popover-arrow" aria-hidden="true"></div>
                        <div className="popover-header">
                          <strong>{chip.name}</strong>
                          <button 
                            type="button" 
                            className="popover-close-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveChip(null);
                            }}
                            aria-label="Close note"
                          >
                            ×
                          </button>
                        </div>
                        <p className="popover-text">{chip.note}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Featured Dish Interactive Floating Card */}
            <div className="featured-dish-banner">
              <div className="featured-banner-left">
                <div className="featured-eyebrow">
                  <span className="veg-indicator-dot" aria-hidden="true"></span>
                  <span>Pure Vegetarian • 100% Plant-Based Dairy</span>
                </div>
                <h2 className="featured-banner-title">
                  Artisanal Saffron & Wild Porcini Risotto
                </h2>
                <div className="featured-banner-meta">
                  <span className="meta-pill">⏱ 30 mins</span>
                  <span className="meta-pill">🍽 4 servings</span>
                  <span className="meta-pill">🌾 Intermediate</span>
                  <span className="meta-pill">⚡ 490 kcal</span>
                </div>
              </div>

              <div className="featured-banner-right">
                <button
                  type="button"
                  className="btn btn-primary featured-open-btn"
                  onClick={onFeaturedClick}
                  id="hero-featured-recipe-btn"
                >
                  <span>View Recipe & Checklist</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Curated Collection Preview Strip (Helpful culinary preview) */}
        {previewRecipes && previewRecipes.length > 0 && (
          <section className="hero-preview-shelf" aria-labelledby="preview-shelf-title">
            <div className="shelf-header-row">
              <div className="shelf-title-wrap">
                <span className="shelf-eyebrow">From Your Kitchen Collection</span>
                <h3 id="preview-shelf-title" className="shelf-title">Featured Favorites Ready to Cook</h3>
              </div>
              <button 
                type="button" 
                className="shelf-view-all-btn"
                onClick={onExplore}
              >
                <span>View Full Cookbook ({savedCount})</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>

            <div className="shelf-cards-grid">
              {previewRecipes.map((recipe) => (
                <article key={recipe.id} className="shelf-recipe-card">
                  <div 
                    className="shelf-card-media"
                    onClick={() => onViewRecipe(recipe)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onViewRecipe(recipe); }}
                    aria-label={`View recipe for ${recipe.title}`}
                  >
                    <img 
                      src={recipe.image} 
                      alt={recipe.alt || recipe.title} 
                      className="shelf-card-img"
                      loading="lazy"
                    />
                    <span className="shelf-card-category">{recipe.category}</span>
                  </div>

                  <div className="shelf-card-body">
                    <h4 
                      className="shelf-card-title"
                      onClick={() => onViewRecipe(recipe)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onViewRecipe(recipe); }}
                    >
                      {recipe.title}
                    </h4>

                    <div className="shelf-card-meta">
                      <span>⏱ {recipe.cookTime}</span>
                      <span>•</span>
                      <span>🍽 {recipe.servings} servings</span>
                    </div>

                    <div className="shelf-card-footer">
                      <button 
                        type="button" 
                        className="btn btn-secondary btn-sm shelf-cook-btn"
                        onClick={() => onViewRecipe(recipe)}
                      >
                        Cook Dish
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}
