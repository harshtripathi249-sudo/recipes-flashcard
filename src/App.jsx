import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_RECIPES } from './data/initialRecipes';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FilterBar from './components/FilterBar';
import RecipeList from './components/RecipeList';
import DiscoverSection from './components/DiscoverSection';
import RecipeDetailModal from './components/RecipeDetailModal';
import RecipeFormModal from './components/RecipeFormModal';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import ToastNotification from './components/ToastNotification';
import Footer from './components/Footer';

const STORAGE_KEY = 'savoria_curated_recipes_veg_v2';

export default function App() {
  // 1. Core State: Recipes (persisted in localStorage)
  const [recipes, setRecipes] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Failed to parse saved recipes from localStorage:', err);
    }
    return INITIAL_RECIPES;
  });

  // 2. Synchronize recipes to localStorage (pure effect synchronization)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
    } catch (err) {
      console.error('Failed to persist recipes to localStorage:', err);
    }
  }, [recipes]);

  // 3. Top-Level Active View Mode: 'my-recipes' | 'discover'
  const [activeView, setActiveView] = useState('my-recipes');

  // 4. UI Filtering & Search State (for My Recipes)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  // Discovery search query triggered from Hero Command Bar
  const [discoverQuery, setDiscoverQuery] = useState('');

  // 5. Modal Dialog State
  const [activeModal, setActiveModal] = useState(null); 
  // null | { type: 'view', recipe } | { type: 'create' } | { type: 'edit', recipe } | { type: 'delete', recipe }

  // 6. Toast Feedback State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Helper: scroll smoothly to target element
  const scrollToTarget = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Hero Search Handler
  const handleHeroSearch = (query) => {
    setDiscoverQuery(query);
    setActiveView('discover');
    setTimeout(() => scrollToTarget('discover-area'), 50);
  };

  // Hero Category Select Handler
  const handleHeroCategorySelect = (category) => {
    setSelectedCategory(category);
    setActiveView('my-recipes');
    setTimeout(() => scrollToTarget('recipe-collection'), 50);
  };

  // --- CRUD Handlers (Strictly Immutable State Updates) ---

  // Create or Update
  const handleSaveRecipe = (recipeData) => {
    const isExisting = recipes.some((r) => r.id === recipeData.id);

    if (isExisting) {
      setRecipes((prev) =>
        prev.map((r) => (r.id === recipeData.id ? { ...r, ...recipeData } : r))
      );
      showToast(`Updated "${recipeData.title}" successfully.`);
    } else {
      setRecipes((prev) => [recipeData, ...prev]);
      showToast(`Added "${recipeData.title}" to your recipe book.`);
    }
    setActiveModal(null);
  };

  // Save discovered recipe (from TheMealDB or Gemini AI) into My Recipes
  const handleSaveDiscoveredRecipe = (discoveredRecipe) => {
    const isAlreadySaved = recipes.some(
      (r) => r.id === discoveredRecipe.id || r.title.toLowerCase() === discoveredRecipe.title.toLowerCase()
    );

    if (isAlreadySaved) {
      showToast(`"${discoveredRecipe.title}" is already in your cookbook.`, 'info');
      return;
    }

    const formattedRecipe = {
      ...discoveredRecipe,
      id: discoveredRecipe.id || `saved-${Date.now()}`,
      isFavorite: false,
      createdAt: Date.now()
    };

    setRecipes((prev) => [formattedRecipe, ...prev]);
    showToast(`Saved "${discoveredRecipe.title}" to My Recipes!`, 'success');
  };

  // Delete
  const handleConfirmDelete = (recipeId) => {
    const target = recipes.find((r) => r.id === recipeId);
    setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
    showToast(
      target ? `Deleted "${target.title}".` : 'Recipe removed.',
      'delete'
    );
    setActiveModal(null);
  };

  // Favorite Toggle
  const handleToggleFavorite = (recipeId) => {
    setRecipes((prev) =>
      prev.map((r) => {
        if (r.id === recipeId) {
          const nextFav = !r.isFavorite;
          showToast(
            nextFav
              ? `Added "${r.title}" to favorites.`
              : `Removed "${r.title}" from favorites.`,
            'info'
          );
          return { ...r, isFavorite: nextFav };
        }
        return r;
      })
    );
  };

  // Restore defaults
  const handleRestoreDefaults = () => {
    setRecipes(INITIAL_RECIPES);
    showToast('Restored default curated recipes.');
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setShowFavoritesOnly(false);
    setSortBy('newest');
  };

  // --- Derived Filtered & Sorted Recipes for My Recipes ---
  const filteredRecipes = useMemo(() => {
    return recipes
      .filter((r) => {
        // Category filter
        if (selectedCategory !== 'All' && r.category !== selectedCategory) {
          return false;
        }

        // Favorites filter
        if (showFavoritesOnly && !r.isFavorite) {
          return false;
        }

        // Search query filter (matches title, description, ingredients, notes)
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchTitle = r.title?.toLowerCase().includes(query);
          const matchDesc = r.description?.toLowerCase().includes(query);
          const matchCategory = r.category?.toLowerCase().includes(query);
          const matchNotes = r.notes?.toLowerCase().includes(query);
          const matchIngredients = r.ingredients?.some((ing) =>
            ing.toLowerCase().includes(query)
          );
          return matchTitle || matchDesc || matchCategory || matchNotes || matchIngredients;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return (b.createdAt || 0) - (a.createdAt || 0);
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'servings') {
          return (b.servings || 0) - (a.servings || 0);
        }
        if (sortBy === 'time') {
          const parseTime = (str) => {
            const m = parseInt(str, 10);
            return isNaN(m) ? 0 : m;
          };
          return parseTime(a.cookTime) - parseTime(b.cookTime);
        }
        return 0;
      });
  }, [recipes, selectedCategory, showFavoritesOnly, searchQuery, sortBy]);

  const favoritesCount = useMemo(() => {
    return recipes.filter((r) => r.isFavorite).length;
  }, [recipes]);

  // Helper to check if a recipe object is saved in My Recipes
  const isRecipeSaved = (recipe) => {
    if (!recipe) return false;
    return recipes.some(
      (r) => r.id === recipe.id || r.title.toLowerCase() === recipe.title.toLowerCase()
    );
  };

  const previewRecipes = useMemo(() => {
    return recipes.filter((r) => r.id !== 'recipe-risotto').slice(0, 3);
  }, [recipes]);

  return (
    <div className="app-layout" id="top">
      {/* 1. Global Navigation Bar */}
      <Navbar
        activeView={activeView}
        onSelectView={setActiveView}
        savedCount={recipes.length}
        favoritesCount={favoritesCount}
        onAddRecipe={() => setActiveModal({ type: 'create' })}
        onToggleFavoritesOnly={(val) => {
          setActiveView('my-recipes');
          setShowFavoritesOnly(val);
        }}
        showFavoritesOnly={showFavoritesOnly}
        onScrollToRecipes={() => scrollToTarget(activeView === 'my-recipes' ? 'recipe-collection' : 'discover-area')}
      />

      {/* 2. Hero Presentation Section (Smart Kitchen Assistant - Direction 2) */}
      <HeroSection
        onSearch={handleHeroSearch}
        onExplore={() => {
          setActiveView('my-recipes');
          scrollToTarget('recipe-collection');
        }}
        onDiscover={() => {
          setActiveView('discover');
          scrollToTarget('discover-area');
        }}
        onAddRecipe={() => setActiveModal({ type: 'create' })}
        onFeaturedClick={() => {
          const featured = recipes.find((r) => r.id === 'recipe-risotto') || recipes[0];
          if (featured) {
            setActiveModal({ type: 'view', recipe: featured });
          }
        }}
        onViewRecipe={(recipe) => setActiveModal({ type: 'view', recipe })}
        onCategorySelect={handleHeroCategorySelect}
        savedCount={recipes.length}
        previewRecipes={previewRecipes}
      />

      {/* 3. Main Content Section */}
      <main className="main-content-section" aria-label="Recipe Management Area">
        <div className="section-container">
          {/* View Mode Switcher Header Tabs */}
          <div className="section-header-row">
            <div className="section-title-group">
              <span className="section-badge">
                {activeView === 'my-recipes' ? 'Personal Cookbook' : 'Online Discovery'}
              </span>
              <h2 className="section-heading">
                {activeView === 'my-recipes' ? 'My Saved Recipes' : 'Discover Recipes Online'}
              </h2>
              <p className="section-subheading">
                {activeView === 'my-recipes' 
                  ? 'Your saved culinary collection with custom notes, ingredient checklists, and quick categories.'
                  : 'Search international dishes from TheMealDB or formulate new recipes with Gemini AI.'
                }
              </p>
            </div>

            {/* View Switcher Toggle Bar */}
            <div className="view-toggle-bar">
              <button
                type="button"
                className={`view-toggle-btn ${activeView === 'my-recipes' ? 'active' : ''}`}
                onClick={() => setActiveView('my-recipes')}
              >
                <span>My Recipes ({recipes.length})</span>
              </button>
              <button
                type="button"
                className={`view-toggle-btn ${activeView === 'discover' ? 'active' : ''}`}
                onClick={() => setActiveView('discover')}
              >
                <span>Discover Online (TheMealDB + AI)</span>
              </button>
            </div>
          </div>

          {/* VIEW 1: MY RECIPES */}
          {activeView === 'my-recipes' && (
            <>
              {/* Filtering, Search & Sort Bar */}
              <FilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                showFavoritesOnly={showFavoritesOnly}
                onToggleFavorites={setShowFavoritesOnly}
                sortBy={sortBy}
                onSortChange={setSortBy}
                totalResults={filteredRecipes.length}
                onResetFilters={handleResetFilters}
              />

              {/* Recipe List / Grid / Empty State */}
              <RecipeList
                recipes={filteredRecipes}
                totalCollectionCount={recipes.length}
                showFavoritesOnly={showFavoritesOnly}
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                onViewRecipe={(recipe) => setActiveModal({ type: 'view', recipe })}
                onEditRecipe={(recipe) => setActiveModal({ type: 'edit', recipe })}
                onDeleteRecipe={(recipe) => setActiveModal({ type: 'delete', recipe })}
                onToggleFavorite={handleToggleFavorite}
                onResetFilters={handleResetFilters}
                onAddRecipe={() => setActiveModal({ type: 'create' })}
                onRestoreDefaults={handleRestoreDefaults}
              />
            </>
          )}

          {/* VIEW 2: DISCOVER RECIPES ONLINE */}
          {activeView === 'discover' && (
            <DiscoverSection
              savedRecipes={recipes}
              onSaveToMyRecipes={handleSaveDiscoveredRecipe}
              onViewRecipe={(recipe) => setActiveModal({ type: 'view', recipe })}
              initialQuery={discoverQuery}
            />
          )}
        </div>
      </main>

      {/* 4. Global Footer */}
      <Footer
        onScrollToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onAddRecipe={() => setActiveModal({ type: 'create' })}
      />

      {/* --- Modal Dialogs --- */}

      {/* Detail Modal */}
      {activeModal?.type === 'view' && (
        <RecipeDetailModal
          recipe={activeModal.recipe}
          onClose={() => setActiveModal(null)}
          onEdit={(recipe) => setActiveModal({ type: 'edit', recipe })}
          onDelete={(recipe) => setActiveModal({ type: 'delete', recipe })}
          onToggleFavorite={handleToggleFavorite}
          isSavedInCollection={isRecipeSaved(activeModal.recipe)}
          onSaveToCollection={(recipe) => {
            handleSaveDiscoveredRecipe(recipe);
          }}
        />
      )}

      {/* Create / Edit Form Modal */}
      {(activeModal?.type === 'create' || activeModal?.type === 'edit') && (
        <RecipeFormModal
          isOpen={true}
          recipeToEdit={activeModal.type === 'edit' ? activeModal.recipe : null}
          onClose={() => setActiveModal(null)}
          onSave={handleSaveRecipe}
        />
      )}

      {/* Delete Confirmation Modal */}
      {activeModal?.type === 'delete' && (
        <ConfirmDeleteModal
          isOpen={true}
          recipe={activeModal.recipe}
          onClose={() => setActiveModal(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {/* Toast Notification Alert */}
      <ToastNotification
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
