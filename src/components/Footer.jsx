import React from 'react';

export default function Footer({ onScrollToTop, onAddRecipe }) {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="brand-icon-wrapper" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
              </svg>
            </div>
            <div>
              <span className="footer-brand-name">Savoria</span>
              <p className="footer-brand-tagline">Curated culinary journal & mindful kitchen studio</p>
            </div>
          </div>

          <div className="footer-links">
            <button type="button" className="footer-link-btn" onClick={onScrollToTop}>
              Back to Top ↑
            </button>
            <button type="button" className="footer-link-btn" onClick={onAddRecipe}>
              + Add Recipe
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Savoria Recipe Book. Handcrafted with passion for food & design.</p>
          <p className="footer-note">All dishes 100% chef-tested & naturally styled.</p>
        </div>
      </div>
    </footer>
  );
}
