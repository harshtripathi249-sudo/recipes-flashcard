import React, { useState } from 'react';

export default function RecipeCard({
  recipe,
  onView,
  onEdit,
  onDelete,
  onToggleFavorite
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <article className="recipe-card" tabIndex="0" onClick={() => onView(recipe)} onKeyDown={(e) => { if (e.key === 'Enter') onView(recipe); }}>
      {/* Recipe Media & Overlays */}
      <div className="card-media-wrapper">
        {!imgError ? (
          <img
            src={recipe.image}
            alt={recipe.alt || `${recipe.title} plated dish`}
            className="card-image"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="card-image-fallback" role="img" aria-label={`${recipe.title} image placeholder`}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8C827A" strokeWidth="1.5">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            <span className="fallback-text">{recipe.category}</span>
          </div>
        )}

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
          {recipe.description || 'Delicious home-tested recipe with fresh ingredients.'}
        </p>

        {/* Metadata Details at a Glance */}
        <div className="card-meta-row">
          <div className="meta-badge" title="Cook time">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>{recipe.cookTime || '20 mins'}</span>
          </div>

          <div className="meta-badge" title="Servings">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>{recipe.servings} serv.</span>
          </div>

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
