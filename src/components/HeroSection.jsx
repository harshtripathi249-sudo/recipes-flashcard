import React, { useState, useEffect, useRef } from 'react';
import RecipePhoto from './RecipePhoto';
import { INITIAL_RECIPES } from '../data/initialRecipes';

const BROWSE_CATEGORIES = [
  { id: 'All', label: 'All recipes' },
  { id: 'Artisanal Pastas', label: 'Pastas' },
  { id: 'Grain Bowls', label: 'Grain bowls' },
  { id: 'Gourmet Mains', label: 'Mains' },
  { id: 'Breakfast & Pastries', label: 'Breakfast & pastries' },
  { id: 'Seasonal Desserts', label: 'Desserts' }
];

function metaLine(recipe) {
  return [
    recipe.cuisine,
    recipe.cookTime,
    recipe.servings ? `Serves ${recipe.servings}` : ''
  ].filter(Boolean).join(' · ');
}

const ArrowIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

// Reveals [data-reveal] children once as they enter the viewport.
function useScrollReveal(containerRef, deps) {
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return undefined;
    const items = root.querySelectorAll('[data-reveal]');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'));
      return undefined;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// Gentle depth for the featured dish: the photo and its close-up details shift a few
// pixels with the pointer (fine pointers only) and with scroll. Event-driven only,
// so nothing animates on its own. Skipped entirely for reduced motion.
function useHeroDepth(figureRef) {
  useEffect(() => {
    const fig = figureRef.current;
    if (!fig || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const hero = fig.closest('.hero');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let mx = 0;
    let my = 0;
    let frame = 0;

    const render = () => {
      frame = 0;
      const progress = Math.min(Math.max(window.scrollY / window.innerHeight, 0), 1);
      fig.style.setProperty('--sy', progress.toFixed(3));
      fig.style.setProperty('--mx', mx.toFixed(3));
      fig.style.setProperty('--my', my.toFixed(3));
    };
    const queue = () => { if (!frame) frame = requestAnimationFrame(render); };
    const onMove = (e) => {
      const r = hero.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      my = ((e.clientY - r.top) / r.height - 0.5) * 2;
      queue();
    };
    const onLeave = () => { mx = 0; my = 0; queue(); };

    window.addEventListener('scroll', queue, { passive: true });
    if (finePointer && hero) {
      hero.addEventListener('pointermove', onMove);
      hero.addEventListener('pointerleave', onLeave);
    }
    queue();

    return () => {
      window.removeEventListener('scroll', queue);
      if (hero) {
        hero.removeEventListener('pointermove', onMove);
        hero.removeEventListener('pointerleave', onLeave);
      }
      if (frame) cancelAnimationFrame(frame);
    };
  }, [figureRef]);
}

// background-position (%) that centres fraction `f` of the image when zoomed by `zoom`
const focusPercent = (f, zoom) => Math.min(Math.max(((f * zoom - 0.5) / (zoom - 1)) * 100, 0), 100);

export default function HeroSection({
  onSearch,
  onExplore,
  onDiscover,
  onAddRecipe,
  onFeaturedClick,
  onViewRecipe,
  onCategorySelect,
  savedCount = 0,
  previewRecipes = [],
  featuredRecipe,
  featuredDetails = []
}) {
  const [searchInput, setSearchInput] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const shelfRef = useRef(null);
  const figureRef = useRef(null);
  const [photoReady, setPhotoReady] = useState(false);

  // 4 Featured dishes for the contained food-image animation using existing assets
  const dishes = React.useMemo(() => {
    const list = [
      featuredRecipe,
      ...(previewRecipes || []).filter((r) => r.id !== featuredRecipe?.id),
      ...INITIAL_RECIPES.filter((r) => r.id !== featuredRecipe?.id)
    ].filter(Boolean);

    const unique = [];
    const seen = new Set();
    for (const r of list) {
      if (!seen.has(r.id)) {
        seen.add(r.id);
        unique.push(r);
        if (unique.length === 4) break;
      }
    }
    return unique.length > 0 ? unique : [featuredRecipe];
  }, [featuredRecipe, previewRecipes]);

  const [activeDishIndex, setActiveDishIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance through the 4 dishes smoothly, respecting reduced-motion preferences
  useEffect(() => {
    if (dishes.length <= 1 || isPaused) return undefined;
    const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return undefined;

    const timer = setInterval(() => {
      setActiveDishIndex((prev) => (prev + 1) % dishes.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [dishes.length, isPaused]);

  const activeDish = dishes[activeDishIndex] || featuredRecipe;

  useScrollReveal(shelfRef, [previewRecipes.length]);
  useHeroDepth(figureRef);

  // Close-up details are cropped from the photo itself, so only show them once it has loaded.
  useEffect(() => {
    const img = figureRef.current?.querySelector('.hero-photo-slide.is-active img') || 
                figureRef.current?.querySelector('img.hero-photo-img');
    if (img?.complete && img.naturalWidth > 0) setPhotoReady(true);
  }, [activeDish?.image]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const term = searchInput.trim();
    if (term) onSearch(term);
    else onDiscover();
  };

  const handleCategoryClick = (id) => {
    setActiveCategory(id);
    if (onCategorySelect) onCategorySelect(id);
  };

  return (
    <>
      <section className="hero" aria-labelledby="hero-heading">
        <div className="hero-inner">
          <div className="hero-copy">
            <p className="hero-kicker" style={{ '--i': 0 }}>Search, save, cook</p>
            <h1 id="hero-heading" className="hero-title" style={{ '--i': 1 }}>
              Find a dinner <em>worth cooking.</em>
            </h1>
            <p className="hero-lead" style={{ '--i': 2 }}>
              Search recipes from TheMealDB, keep the ones you like in your own cookbook, and add your own.
            </p>

            <form className="hero-search" onSubmit={handleSubmit} role="search" aria-label="Search recipes online" style={{ '--i': 3 }}>
              <label htmlFor="hero-search-input" className="sr-only">Search for a dish</label>
              <input
                id="hero-search-input"
                type="text"
                className="hero-search-input"
                placeholder="Try shakshuka, dal, ratatouille…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                autoComplete="off"
              />
              <button type="submit" className="hero-cta" id="hero-discover-btn">
                <span>Discover Recipes</span>
                <ArrowIcon />
              </button>
            </form>

            <div className="hero-secondary" style={{ '--i': 4 }}>
              <button type="button" className="hero-ghost" onClick={onExplore} id="hero-link-cookbook">
                My Cookbook <span className="hero-count">{savedCount}</span>
              </button>
              <button type="button" className="hero-ghost" onClick={onAddRecipe} id="hero-link-add">
                Add Recipe
              </button>
            </div>
          </div>

          {activeDish && (
            <figure 
              className="hero-figure" 
              ref={figureRef}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="hero-photo-wrap">
                <button
                  type="button"
                  className="hero-photo"
                  onClick={() => onFeaturedClick && onFeaturedClick(activeDish)}
                  aria-label={`View recipe: ${activeDish.title}`}
                  id="hero-featured-recipe-btn"
                >
                  <div className="hero-photo-slides">
                    {dishes.map((dish, idx) => {
                      const isActive = idx === activeDishIndex;
                      return (
                        <div
                          key={dish.id || idx}
                          className={`hero-photo-slide ${isActive ? 'is-active' : ''}`}
                          aria-hidden={!isActive}
                        >
                          <RecipePhoto
                            src={dish.image}
                            alt={dish.alt || dish.title}
                            label={dish.title}
                            className="hero-photo-img"
                            eager={idx === 0}
                            fetchPriority={idx === 0 ? "high" : "auto"}
                            onLoad={idx === 0 ? () => setPhotoReady(true) : undefined}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {dishes.length > 1 && (
                    <div 
                      className="hero-photo-indicators" 
                      role="tablist" 
                      aria-label="Featured dishes navigation"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {dishes.map((dish, idx) => (
                        <button
                          key={dish.id || idx}
                          type="button"
                          role="tab"
                          aria-selected={idx === activeDishIndex}
                          className={`hero-photo-dot ${idx === activeDishIndex ? 'active' : ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setActiveDishIndex(idx);
                          }}
                          aria-label={`Show ${dish.title}`}
                          title={dish.title}
                        />
                      ))}
                    </div>
                  )}
                </button>

                {photoReady && activeDishIndex === 0 && featuredDetails.length > 0 && (
                  <div className="hero-details" aria-hidden="true">
                    {featuredDetails.map((d, i) => (
                      <span
                        key={d.id}
                        className={`hero-detail hero-detail-${d.id}`}
                        style={{
                          '--k': i,
                          backgroundImage: `url("${activeDish.image}")`,
                          backgroundSize: `${d.zoom * 100}%`,
                          backgroundPosition: `${focusPercent(d.x, d.zoom)}% ${focusPercent(d.y, d.zoom)}%`
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <figcaption className="hero-caption">
                <div className="hero-caption-text">
                  <span className="hero-caption-kicker">Featured recipe</span>
                  <span className="hero-caption-title">{activeDish.title}</span>
                  <span className="hero-caption-meta">
                    {[activeDish.cuisine, activeDish.mealDbCategory || activeDish.category].filter(Boolean).join(' · ')}
                  </span>
                </div>
                <button 
                  type="button" 
                  className="hero-caption-link" 
                  onClick={() => onFeaturedClick && onFeaturedClick(activeDish)}
                >
                  <span>View recipe</span>
                  <ArrowIcon size={16} />
                </button>
              </figcaption>
              {activeDish.mealDbUrl && (
                <p className="hero-credit">
                  Recipe and photo:{' '}
                  <a href={activeDish.mealDbUrl} target="_blank" rel="noopener noreferrer">TheMealDB</a>
                </p>
              )}
            </figure>
          )}
        </div>
      </section>

      <section className="hero-browse" ref={shelfRef} aria-labelledby="shelf-heading">
        <div className="hero-browse-inner">
          <div className="browse-head" data-reveal>
            <div>
              <p className="section-kicker">From your cookbook</p>
              <h2 id="shelf-heading" className="shelf-heading">Ready to cook</h2>
            </div>
            <button type="button" className="shelf-all-link" onClick={onExplore}>
              <span>View all {savedCount}</span>
              <ArrowIcon size={15} />
            </button>
          </div>

          <div className="browse-chips" role="toolbar" aria-label="Browse cookbook by category" data-reveal>
            {BROWSE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`browse-chip ${activeCategory === cat.id ? 'active' : ''}`}
                aria-pressed={activeCategory === cat.id}
                onClick={() => handleCategoryClick(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {previewRecipes.length > 0 && (
            <div className="shelf-grid">
              {previewRecipes.map((recipe, i) => (
                <button
                  key={recipe.id}
                  type="button"
                  className="shelf-card"
                  style={{ '--i': i }}
                  data-reveal
                  onClick={() => onViewRecipe(recipe)}
                  aria-label={`View recipe: ${recipe.title}`}
                >
                  <span className="shelf-card-media">
                    <RecipePhoto
                      src={recipe.image}
                      alt={recipe.alt}
                      label={recipe.category}
                      className="shelf-card-img"
                    />
                  </span>
                  <span className="shelf-card-body">
                    <span className="shelf-card-cat">{recipe.category}</span>
                    <span className="shelf-card-title">{recipe.title}</span>
                    {metaLine(recipe) && <span className="shelf-card-meta">{metaLine(recipe)}</span>}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
