import React from 'react';
import RecipePhoto from './RecipePhoto';

export default function RecipeCard({
  recipe,
  onView,
  onEdit,
  onDelete,
  onToggleFavorite
}) {
  return (
    <article className="recipe-card" tabIndex="0" onClick={() => onView(recipe)} onKeyDown={(e) => { if (e.key === 'Enter') onView(recipe); }}>
      {/* Recipe Media & Overlays */}
      <div className="card-media-wrapper">
        <RecipePhoto
          src={recipe.image}
          alt={recipe.alt || `${recipe.title}`}
          label={recipe.category}
          className="card-image"
        />

        {/* Category Pill Tag */}
        <span className="card-category-badge">{recipe.category}</span>

        {/* Favorite Heart Button */}
        <button
          type="button"
          className={`card-favorite-btn ${recipe.isFavorite ? 'active' : ''}`}
          aria-label={recipe.isFavorite ? `Remove ${recipe.title} from favorites` : `Add ${recipe.title} to favorites`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(recipe.id);
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={recipe.isFavorite ? "#D96B43" : "none"} stroke={recipe.isFavorite ? "#D96B43" : "currentColor"} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Recipe Info Body */}
      <div className="card-content">
        <h3 className="card-title">{recipe.title}</h3>
        
        <p className="card-description">
          {recipe.description || [recipe.cuisine, recipe.mealDbCategory].filter(Boolean).join(' · ')}
        </p>

        {/* Metadata Details at a Glance */}
        <div className="card-meta-row">
          {recipe.cookTime && (
            <div className="meta-badge" title="Cook time">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>{recipe.cookTime}</span>
            </div>
          )}

          {recipe.servings ? (
            <div className="meta-badge" title="Servings">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span>{recipe.servings} serv.</span>
            </div>
          ) : null}

          {recipe.cuisine && (
            <div className="meta-badge" title="Cuisine">
              <span>{recipe.cuisine}</span>
            </div>
          )}

          {recipe.difficulty && (
            <div className="meta-badge difficulty-badge" title="Difficulty level">
              <span>{recipe.difficulty}</span>
            </div>
          )}
        </div>

        {/* Card Footer Actions */}
        <div className="card-footer-actions">
          <button
            type="button"
            className="btn btn-outline-primary btn-sm card-view-btn"
            onClick={(e) => {
              e.stopPropagation();
              onView(recipe);
            }}
          >
            <span>View Recipe</span>
          </button>

          <div className="card-crud-buttons">
            <button
              type="button"
              className="icon-action-btn edit-btn"
              title="Edit Recipe"
              aria-label={`Edit ${recipe.title}`}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(recipe);
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>

            <button
              type="button"
              className="icon-action-btn delete-btn"
              title="Delete Recipe"
              aria-label={`Delete ${recipe.title}`}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(recipe);
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
