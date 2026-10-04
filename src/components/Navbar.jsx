import React, { useState } from 'react';

export default function Navbar({ 
  activeView,
  onSelectView,
  savedCount,
  favoritesCount, 
  onAddRecipe, 
  onToggleFavoritesOnly,
  showFavoritesOnly,
  onScrollToRecipes 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (callback) => {
    if (callback) callback();
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar-header" id="main-nav">
      <div className="navbar-container">
        {/* Brand */}
        <a 
          href="#top" 
          className="navbar-brand" 
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        >
          <div className="brand-icon-wrapper" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
              <line x1="6" y1="1" x2="6" y2="4"></line>
              <line x1="10" y1="1" x2="10" y2="4"></line>
              <line x1="14" y1="1" x2="14" y2="4"></line>
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-title">Savoria</span>
            <span className="brand-tagline">Recipe Studio</span>
          </div>
        </a>

        {/* View Switcher Tabs (My Recipes vs Discover Online) */}
        <div className="navbar-view-switcher" role="tablist" aria-label="Recipe views">
          <button
            type="button"
            role="tab"
            aria-selected={activeView === 'my-recipes'}
            className={`view-tab-btn ${activeView === 'my-recipes' ? 'active' : ''}`}
            onClick={() => {
              onSelectView('my-recipes');
              onScrollToRecipes();
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            <span>My Recipes</span>
            <span className="tab-count-pill">{savedCount}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeView === 'discover'}
            className={`view-tab-btn ${activeView === 'discover' ? 'active' : ''}`}
            onClick={() => {
              onSelectView('discover');
              onScrollToRecipes();
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
            </svg>
            <span>Discover Online</span>
            <span className="tab-live-badge">TheMealDB + AI</span>
          </button>
        </div>

        {/* Desktop Navigation Actions */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          {activeView === 'my-recipes' && (
            <button 
              type="button" 
              className={`nav-link-btn favorite-link ${showFavoritesOnly ? 'active' : ''}`}
              onClick={() => {
                onToggleFavoritesOnly(!showFavoritesOnly);
                onScrollToRecipes();
              }}
              title="Show only favorite recipes"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={showFavoritesOnly ? "#D96B43" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span>Favorites</span>
              {favoritesCount > 0 && (
                <span className="nav-badge" aria-label={`${favoritesCount} favorites`}>{favoritesCount}</span>
              )}
            </button>
          )}

          <button 
            type="button" 
            className="btn btn-primary"
            onClick={onAddRecipe}
            id="btn-add-recipe-nav"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>New Recipe</span>
          </button>
        </nav>

        {/* Mobile Hamburger Toggle */}
        <button 
          type="button" 
          className="mobile-menu-toggle"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer" id="mobile-nav-panel">
          <button 
            type="button" 
            className={`mobile-nav-item ${activeView === 'my-recipes' ? 'active' : ''}`}
            onClick={() => handleNavClick(() => {
              onSelectView('my-recipes');
              onScrollToRecipes();
            })}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            <span>My Recipes ({savedCount})</span>
          </button>

          <button 
            type="button" 
            className={`mobile-nav-item ${activeView === 'discover' ? 'active' : ''}`}
            onClick={() => handleNavClick(() => {
              onSelectView('discover');
              onScrollToRecipes();
            })}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
            </svg>
            <span>Discover Online (TheMealDB + AI)</span>
          </button>

          <button 
            type="button" 
            className={`mobile-nav-item ${showFavoritesOnly ? 'active' : ''}`}
            onClick={() => handleNavClick(() => {
              onSelectView('my-recipes');
              onToggleFavoritesOnly(!showFavoritesOnly);
              onScrollToRecipes();
            })}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={showFavoritesOnly ? "#D96B43" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span>Favorites ({favoritesCount})</span>
          </button>

          <button 
            type="button" 
            className="btn btn-primary mobile-add-btn"
            onClick={() => handleNavClick(onAddRecipe)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Add New Recipe</span>
          </button>
        </div>
      )}
    </header>
  );
}
