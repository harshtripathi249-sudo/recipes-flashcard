import React from 'react';

export default function EmptyState({
  type = 'filter', // 'filter' | 'collection' | 'favorites'
  searchQuery,
  onResetFilters,
  onAddRecipe,
  onRestoreDefaults
}) {
  if (type === 'collection') {
    return (
      <div className="empty-state-card" role="region" aria-label="Empty recipe collection">
        <div className="empty-state-icon-wrapper">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2D5A43" strokeWidth="1.5">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            <line x1="9" y1="7" x2="15" y2="7"></line>
            <line x1="9" y1="11" x2="13" y2="11"></line>
          </svg>
        </div>
        <h3 className="empty-state-title">Your Recipe Book is Empty</h3>
        <p className="empty-state-message">
          Begin your personal cookbook by creating your first artisanal dish, or reload our curated chef-tested recipes to explore.
        </p>
        <div className="empty-state-actions">
          <button type="button" className="btn btn-primary" onClick={onAddRecipe}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Create First Recipe</span>
          </button>
          {onRestoreDefaults && (
            <button type="button" className="btn btn-secondary" onClick={onRestoreDefaults}>
              <span>Restore Curated Dishes</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  if (type === 'favorites') {
    return (
      <div className="empty-state-card" role="region" aria-label="No favorite recipes">
        <div className="empty-state-icon-wrapper">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D96B43" strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <h3 className="empty-state-title">No Favorites Marked Yet</h3>
        <p className="empty-state-message">
          Click the heart icon on any recipe card to save your most cherished dishes for quick access.
        </p>
        <button type="button" className="btn btn-primary" onClick={onResetFilters}>
          <span>View All Recipes</span>
        </button>
      </div>
    );
  }

  return (
    <div className="empty-state-card" role="region" aria-label="No search results">
      <div className="empty-state-icon-wrapper">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#78716C" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      </div>
      <h3 className="empty-state-title">No Matching Recipes Found</h3>
      <p className="empty-state-message">
        {searchQuery ? (
          <>We couldn’t find any recipes matching &ldquo;<strong>{searchQuery}</strong>&rdquo;. Try searching for an ingredient or clearing filters.</>
        ) : (
          'There are no recipes matching the selected category filter.'
        )}
      </p>
      <div className="empty-state-actions">
        <button type="button" className="btn btn-primary" onClick={onResetFilters}>
          <span>Reset Filters</span>
        </button>
        <button type="button" className="btn btn-secondary" onClick={onAddRecipe}>
          <span>Add Custom Recipe</span>
        </button>
      </div>
    </div>
  );
}
