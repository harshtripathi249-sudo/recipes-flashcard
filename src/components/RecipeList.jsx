import React from 'react';
import RecipeCard from './RecipeCard';
import EmptyState from './EmptyState';

export default function RecipeList({
  recipes,
  totalCollectionCount,
  showFavoritesOnly,
  searchQuery,
  selectedCategory,
  onViewRecipe,
  onEditRecipe,
  onDeleteRecipe,
  onToggleFavorite,
  onResetFilters,
  onAddRecipe,
  onRestoreDefaults
}) {
  // 1. If entire collection is empty
  if (totalCollectionCount === 0) {
    return (
      <EmptyState
        type="collection"
        onAddRecipe={onAddRecipe}
        onRestoreDefaults={onRestoreDefaults}
      />
    );
  }

  // 2. If filtered collection has no matches
  if (recipes.length === 0) {
    return (
      <EmptyState
        type={showFavoritesOnly ? "favorites" : "filter"}
        searchQuery={searchQuery}
        onResetFilters={onResetFilters}
        onAddRecipe={onAddRecipe}
      />
    );
  }

  // 3. Render grid of recipe cards
  return (
    <div className="recipes-grid" role="feed" aria-label="Recipe card list">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          onView={onViewRecipe}
          onEdit={onEditRecipe}
          onDelete={onDeleteRecipe}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
