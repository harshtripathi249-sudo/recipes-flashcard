import React from 'react';
import { CATEGORIES } from '../data/initialRecipes';

export default function FilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  showFavoritesOnly,
  onToggleFavorites,
  sortBy,
  onSortChange,
  totalResults,
  onResetFilters
}) {
  return (
    <div className="filter-bar-wrapper" id="recipe-collection">
      {/* Top Search & Actions Row */}
      <div className="filter-search-row">
        {/* Search Input Box */}
        <div className="search-input-container">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            id="recipe-search-input"
            type="text"
            className="search-input"
            placeholder="Search recipes, ingredients, tags..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search recipes"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              aria-label="Clear search input"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>

        {/* Controls: Favorites Toggle & Sort Dropdown */}
        <div className="filter-controls-group">
          {/* Favorites Filter Button */}
          <button
            type="button"
            className={`filter-btn-toggle ${showFavoritesOnly ? 'active' : ''}`}
            onClick={() => onToggleFavorites(!showFavoritesOnly)}
            aria-pressed={showFavoritesOnly}
            id="toggle-favorites-filter"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={showFavoritesOnly ? "#D96B43" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span>Favorites</span>
          </button>

          {/* Sort Selector */}
          <div className="sort-select-wrapper">
            <label htmlFor="recipe-sort-select" className="sr-only">Sort recipes by</label>
            <span className="sort-label" aria-hidden="true">Sort:</span>
            <select
              id="recipe-sort-select"
              className="sort-select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
            >
              <option value="newest">Recently Added</option>
              <option value="time">Cook Time</option>
              <option value="title">Alphabetical (A–Z)</option>
              <option value="servings">Servings</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills Row */}
      <div className="category-pills-container" role="tablist" aria-label="Recipe categories">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={selectedCategory === category}
            className={`category-pill ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => onSelectCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Results Header / Active Filters info */}
      <div className="filter-summary-row">
        <span className="results-count-text">
          Showing <strong>{totalResults}</strong> {totalResults === 1 ? 'recipe' : 'recipes'}
          {selectedCategory !== 'All' && ` in "${selectedCategory}"`}
          {showFavoritesOnly && ` (Favorites)`}
          {searchQuery && ` matching "${searchQuery}"`}
        </span>

        {(selectedCategory !== 'All' || showFavoritesOnly || searchQuery) && (
          <button
            type="button"
            className="btn-link-reset"
            onClick={onResetFilters}
          >
            Reset all filters
          </button>
        )}
      </div>
    </div>
  );
}
