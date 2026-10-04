import React, { useState, useEffect } from 'react';
import RecipePhoto from './RecipePhoto';

export default function RecipeDetailModal({
  recipe,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
  isSavedInCollection = true,
  onSaveToCollection
}) {
  const [checkedIngredients, setCheckedIngredients] = useState({});

  // Keyboard accessibility: Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!recipe) return null;

  const toggleIngredient = (idx) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-recipe-title">
      <div className="modal-container detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Close Button */}
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close recipe details"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Modal Header Media */}
        <div className="detail-media-container">
          <RecipePhoto
            src={recipe.image}
            alt={recipe.alt || recipe.title}
            label={recipe.category}
            className="detail-header-image"
          />
          <div className="detail-media-overlay">
            <div className="overlay-tags">
              <span className="badge badge-category">{recipe.category}</span>
              {recipe.isAiGenerated && (
                <span className="badge badge-ai">AI-generated</span>
              )}
              {recipe.cuisine && (
                <span className="badge badge-cuisine">{recipe.cuisine}</span>
              )}
            </div>

            {isSavedInCollection && (
              <button
                type="button"
                className={`detail-fav-btn ${recipe.isFavorite ? 'active' : ''}`}
                onClick={() => onToggleFavorite(recipe.id)}
                aria-label={recipe.isFavorite ? "Remove from favorites" : "Save to favorites"}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={recipe.isFavorite ? "#D96B43" : "none"} stroke={recipe.isFavorite ? "#D96B43" : "white"} strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="detail-modal-body">
          {/* AI Disclaimer Alert if applicable */}
          {recipe.isAiGenerated && (
            <div className="ai-modal-disclaimer" role="alert">
              <div>
                <strong>AI-generated recipe.</strong> Written by Gemini AI. It has not been tested or verified, so check quantities, temperatures and cooking times yourself.
              </div>
            </div>
          )}

          <div className="detail-title-row">
            <div>
              <h2 id="modal-recipe-title" className="detail-title">{recipe.title}</h2>
              {recipe.sourceAttribution && (
                <p className="detail-source-attribution">
                  Source: <strong>{recipe.sourceAttribution}</strong>
                  {recipe.sourceUrl && (
                    <a
                      href={recipe.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="source-inline-link"
                    >
                      View original recipe ↗
                    </a>
                  )}
                  {recipe.mealDbUrl && recipe.mealDbUrl !== recipe.sourceUrl && (
                    <a
                      href={recipe.mealDbUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="source-inline-link"
                    >
                      TheMealDB entry ↗
                    </a>
                  )}
                </p>
              )}
              {recipe.imageCredit && recipe.image && (
                <p className="detail-source-attribution">{recipe.imageCredit}</p>
              )}
            </div>
          </div>
          
          {recipe.description && <p className="detail-description">{recipe.description}</p>}

          {/* Quick Info Badges Grid */}
          {(recipe.prepTime || recipe.cookTime || recipe.servings || recipe.difficulty || recipe.cuisine || recipe.calories) && (
            <div className="detail-specs-grid">
              {recipe.prepTime && (
                <div className="spec-item">
                  <span className="spec-label">Prep Time</span>
                  <span className="spec-val">{recipe.prepTime}</span>
                </div>
              )}
              {recipe.cookTime && (
                <div className="spec-item">
                  <span className="spec-label">Cook Time</span>
                  <span className="spec-val">{recipe.cookTime}</span>
                </div>
              )}
              {recipe.servings ? (
                <div className="spec-item">
                  <span className="spec-label">Servings</span>
                  <span className="spec-val">{recipe.servings}</span>
                </div>
              ) : null}
              {recipe.difficulty && (
                <div className="spec-item">
                  <span className="spec-label">Difficulty</span>
                  <span className="spec-val">{recipe.difficulty}</span>
                </div>
              )}
              {recipe.cuisine && (
                <div className="spec-item">
                  <span className="spec-label">Cuisine</span>
                  <span className="spec-val">{recipe.cuisine}</span>
                </div>
              )}
              {recipe.calories && (
                <div className="spec-item">
                  <span className="spec-label">Nutrition (entered by you)</span>
                  <span className="spec-val">{recipe.calories}</span>
                </div>
              )}
            </div>
          )}

          {/* Two-Column Recipe Layout: Ingredients & Directions */}
          <div className="detail-content-columns">
            {/* Ingredients with interactive checkboxes */}
            <div className="detail-column ingredients-column">
              <div className="column-header">
                <h3>Ingredients</h3>
                <span className="column-count">
                  {Object.values(checkedIngredients).filter(Boolean).length}/{recipe.ingredients?.length || 0} gathered
                </span>
              </div>
              <ul className="interactive-ingredients-list">
                {recipe.ingredients?.map((item, idx) => {
                  const isChecked = !!checkedIngredients[idx];
                  return (
                    <li 
                      key={idx} 
                      className={`ingredient-check-item ${isChecked ? 'completed' : ''}`}
                      onClick={() => toggleIngredient(idx)}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // Controlled by parent li onClick
                        aria-label={item}
                        className="ingredient-checkbox"
                      />
                      <span className="ingredient-text">{item}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="detail-column instructions-column">
              <div className="column-header">
                <h3>Preparation Steps</h3>
                <span className="column-count">{recipe.instructions?.length || 0} steps</span>
              </div>
              <ol className="ordered-steps-list">
                {recipe.instructions?.map((step, idx) => (
                  <li key={idx} className="step-item">
                    <div className="step-number" aria-hidden="true">{idx + 1}</div>
                    <div className="step-text">{step}</div>
                  </li>
                ))}
              </ol>

              {/* Chef Notes / Practical Tips Box */}
              {recipe.notes && (
                <div className="chef-notes-box">
                  <div className="chef-notes-header">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2D5A43" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <strong>Notes</strong>
                  </div>
                  <p className="chef-notes-content">{recipe.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Modal Action Bar */}
          <div className="detail-action-bar">
            {isSavedInCollection ? (
              <>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    onClose();
                    onEdit(recipe);
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  <span>Edit Recipe</span>
                </button>

                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={() => {
                    onClose();
                    onDelete(recipe);
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  <span>Delete Recipe</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn btn-accent"
                onClick={() => {
                  onSaveToCollection(recipe);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
                <span>Save to My Recipes</span>
              </button>
            )}

            <button
              type="button"
              className="btn btn-secondary"
              style={{ marginLeft: 'auto' }}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
