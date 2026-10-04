import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '../data/initialRecipes';

const PRESET_IMAGES = [
  { label: 'Saffron Porcini Risotto', url: '/images/hero-saffron-risotto.jpg' },
  { label: 'Tandoori Paneer Tikka', url: '/images/paneer-tikka.jpg' },
  { label: 'Spinach Ricotta Ravioli', url: '/images/spinach-ravioli.jpg' },
  { label: 'Truffle Tagliatelle', url: '/images/truffle-pasta.jpg' },
  { label: 'Mediterranean Grain Bowl', url: '/images/grain-bowl.jpg' },
  { label: 'Butter Croissants & Knots', url: '/images/fresh-pastries.jpg' },
  { label: 'Fig & Pistachio Tart', url: '/images/seasonal-dessert.jpg' },
];

export default function RecipeFormModal({
  recipeToEdit,
  isOpen,
  onClose,
  onSave
}) {
  const isEditing = Boolean(recipeToEdit);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Gourmet Mains');
  const [prepTime, setPrepTime] = useState('15 mins');
  const [cookTime, setCookTime] = useState('25 mins');
  const [servings, setServings] = useState(4);
  const [difficulty, setDifficulty] = useState('Easy');
  const [calories, setCalories] = useState('450 kcal');
  const [image, setImage] = useState('/images/truffle-pasta.jpg');
  const [alt, setAlt] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState(['']);
  const [instructions, setInstructions] = useState(['']);
  const [notes, setNotes] = useState('');

  // Validation errors
  const [errors, setErrors] = useState({});

  // Populate form if editing
  useEffect(() => {
    if (recipeToEdit) {
      setTitle(recipeToEdit.title || '');
      setCategory(recipeToEdit.category || 'Gourmet Mains');
      setPrepTime(recipeToEdit.prepTime || '15 mins');
      setCookTime(recipeToEdit.cookTime || '25 mins');
      setServings(recipeToEdit.servings || 4);
      setDifficulty(recipeToEdit.difficulty || 'Easy');
      setCalories(recipeToEdit.calories || '');
      setImage(recipeToEdit.image || '/images/truffle-pasta.jpg');
      setAlt(recipeToEdit.alt || '');
      setDescription(recipeToEdit.description || '');
      setIngredients(recipeToEdit.ingredients?.length ? [...recipeToEdit.ingredients] : ['']);
      setInstructions(recipeToEdit.instructions?.length ? [...recipeToEdit.instructions] : ['']);
      setNotes(recipeToEdit.notes || '');
      setErrors({});
    } else {
      // Reset defaults for new recipe
      setTitle('');
      setCategory('Gourmet Mains');
      setPrepTime('15 mins');
      setCookTime('20 mins');
      setServings(4);
      setDifficulty('Easy');
      setCalories('480 kcal');
      setImage('/images/truffle-pasta.jpg');
      setAlt('');
      setDescription('');
      setIngredients(['']);
      setInstructions(['']);
      setNotes('');
      setErrors({});
    }
  }, [recipeToEdit, isOpen]);

  // Escape key support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Dynamic ingredient handlers
  const handleIngredientChange = (idx, value) => {
    const updated = [...ingredients];
    updated[idx] = value;
    setIngredients(updated);
  };

  const addIngredientField = () => {
    setIngredients([...ingredients, '']);
  };

  const removeIngredientField = (idx) => {
    if (ingredients.length <= 1) {
      setIngredients(['']);
      return;
    }
    setIngredients(ingredients.filter((_, i) => i !== idx));
  };

  // Dynamic instruction handlers
  const handleInstructionChange = (idx, value) => {
    const updated = [...instructions];
    updated[idx] = value;
    setInstructions(updated);
  };

  const addInstructionField = () => {
    setInstructions([...instructions, '']);
  };

  const removeInstructionField = (idx) => {
    if (instructions.length <= 1) {
      setInstructions(['']);
      return;
    }
    setInstructions(instructions.filter((_, i) => i !== idx));
  };

  // Validate and submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Recipe title is required';
    }

    const filteredIngredients = ingredients.map((i) => i.trim()).filter(Boolean);
    if (filteredIngredients.length === 0) {
      newErrors.ingredients = 'Please provide at least one ingredient';
    }

    const filteredInstructions = instructions.map((i) => i.trim()).filter(Boolean);
    if (filteredInstructions.length === 0) {
      newErrors.instructions = 'Please provide at least one cooking step';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const recipeData = {
      id: isEditing ? recipeToEdit.id : `recipe-${Date.now()}`,
      title: title.trim(),
      category,
      prepTime: prepTime.trim() || '15 mins',
      cookTime: cookTime.trim() || '20 mins',
      servings: Number(servings) || 2,
      difficulty,
      calories: calories.trim(),
      image: image.trim() || '/images/truffle-pasta.jpg',
      alt: alt.trim() || `${title.trim()} plated dish`,
      description: description.trim(),
      ingredients: filteredIngredients,
      instructions: filteredInstructions,
      notes: notes.trim(),
      isFavorite: isEditing ? recipeToEdit.isFavorite : false,
      createdAt: isEditing ? recipeToEdit.createdAt : Date.now()
    };

    onSave(recipeData);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="form-modal-title">
      <div className="modal-container form-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="form-modal-header">
          <div>
            <h2 id="form-modal-title" className="form-modal-title">
              {isEditing ? 'Edit Recipe' : 'Create New Recipe'}
            </h2>
            <p className="form-modal-subtitle">
              {isEditing ? 'Update details, ingredients, or preparation steps.' : 'Add your favorite culinary masterpiece to your personal collection.'}
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close recipe form"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="recipe-edit-form" noValidate>
          <div className="form-body-scroll">
            {/* Title & Category Row */}
            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="recipe-title-input" className="form-label required">
                  Recipe Title
                </label>
                <input
                  id="recipe-title-input"
                  type="text"
                  className={`form-input ${errors.title ? 'is-invalid' : ''}`}
                  placeholder="e.g. Truffle Tagliatelle with Wild Chanterelles"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
                  }}
                  required
                />
                {errors.title && <span className="form-error-msg">{errors.title}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="recipe-category-select" className="form-label required">
                  Category
                </label>
                <select
                  id="recipe-category-select"
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="Quick & Easy">Quick & Easy</option>
                  <option value="Soups & Stews">Soups & Stews</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="recipe-desc-input" className="form-label">
                Brief Teaser / Description
              </label>
              <textarea
                id="recipe-desc-input"
                className="form-textarea"
                rows="2"
                placeholder="A mouthwatering description of flavor profile, aromas, and serving occasion..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Timing, Servings & Difficulty Row */}
            <div className="form-grid-4">
              <div className="form-group">
                <label htmlFor="recipe-preptime-input" className="form-label">
                  Prep Time
                </label>
                <input
                  id="recipe-preptime-input"
                  type="text"
                  className="form-input"
                  placeholder="e.g. 15 mins"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="recipe-cooktime-input" className="form-label">
                  Cook Time
                </label>
                <input
                  id="recipe-cooktime-input"
                  type="text"
                  className="form-input"
                  placeholder="e.g. 25 mins"
                  value={cookTime}
                  onChange={(e) => setCookTime(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="recipe-servings-input" className="form-label">
                  Servings
                </label>
                <input
                  id="recipe-servings-input"
                  type="number"
                  min="1"
                  max="50"
                  className="form-input"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="recipe-difficulty-select" className="form-label">
                  Difficulty
                </label>
                <select
                  id="recipe-difficulty-select"
                  className="form-select"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="Easy">Easy</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Image Selection Section */}
            <div className="form-group">
              <label className="form-label">Food Photography Image</label>
              <div className="preset-images-strip" role="radiogroup" aria-label="Select culinary photograph">
                {PRESET_IMAGES.map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    role="radio"
                    aria-checked={image === preset.url}
                    className={`preset-thumb-btn ${image === preset.url ? 'selected' : ''}`}
                    onClick={() => {
                      setImage(preset.url);
                      if (!alt) setAlt(preset.label);
                    }}
                    title={preset.label}
                  >
                    <img src={preset.url} alt={preset.label} />
                    <span className="preset-label">{preset.label}</span>
                  </button>
                ))}
              </div>

              <div className="form-grid-2 custom-image-row">
                <div>
                  <label htmlFor="recipe-image-url" className="form-sublabel">Or enter custom image URL:</label>
                  <input
                    id="recipe-image-url"
                    type="text"
                    className="form-input"
                    placeholder="/images/truffle-pasta.jpg or https://..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="recipe-image-alt" className="form-sublabel">Image descriptive alt text:</label>
                  <input
                    id="recipe-image-alt"
                    type="text"
                    className="form-input"
                    placeholder="Descriptive text for accessibility"
                    value={alt}
                    onChange={(e) => setAlt(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Ingredients Dynamic Section */}
            <div className="form-group form-dynamic-section">
              <div className="dynamic-section-header">
                <div>
                  <label className="form-label required">Ingredients List</label>
                  <span className="form-hint">Specify quantity and item (e.g. 250g fresh chanterelles)</span>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={addIngredientField}
                >
                  + Add Ingredient
                </button>
              </div>

              {errors.ingredients && <span className="form-error-msg">{errors.ingredients}</span>}

              <div className="dynamic-input-list">
                {ingredients.map((ing, idx) => (
                  <div key={idx} className="dynamic-input-row">
                    <span className="row-index-bullet" aria-hidden="true">•</span>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={`Ingredient ${idx + 1}`}
                      value={ing}
                      onChange={(e) => handleIngredientChange(idx, e.target.value)}
                    />
                    <button
                      type="button"
                      className="icon-action-btn delete-btn"
                      onClick={() => removeIngredientField(idx)}
                      title="Remove ingredient"
                      aria-label={`Remove ingredient ${idx + 1}`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Cooking Instructions Dynamic Section */}
            <div className="form-group form-dynamic-section">
              <div className="dynamic-section-header">
                <div>
                  <label className="form-label required">Preparation Steps</label>
                  <span className="form-hint">Clear, sequential cooking steps</span>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={addInstructionField}
                >
                  + Add Step
                </button>
              </div>

              {errors.instructions && <span className="form-error-msg">{errors.instructions}</span>}

              <div className="dynamic-input-list">
                {instructions.map((inst, idx) => (
                  <div key={idx} className="dynamic-input-row">
                    <span className="row-index-number">{idx + 1}</span>
                    <textarea
                      rows="2"
                      className="form-textarea"
                      placeholder={`Step ${idx + 1} instructions...`}
                      value={inst}
                      onChange={(e) => handleInstructionChange(idx, e.target.value)}
                    />
                    <button
                      type="button"
                      className="icon-action-btn delete-btn"
                      onClick={() => removeInstructionField(idx)}
                      title="Remove step"
                      aria-label={`Remove step ${idx + 1}`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Chef Notes / Pro Tips */}
            <div className="form-group">
              <label htmlFor="recipe-notes-input" className="form-label">
                Chef's Pro Tip or Secret
              </label>
              <input
                id="recipe-notes-input"
                type="text"
                className="form-input"
                placeholder="e.g. Save starchy pasta water to bind the truffle emulsion."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="form-modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              id="btn-save-recipe"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              <span>{isEditing ? 'Save Changes' : 'Create Recipe'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
