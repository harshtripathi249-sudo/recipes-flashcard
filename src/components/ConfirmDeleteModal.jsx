import React, { useEffect } from 'react';

export default function ConfirmDeleteModal({
  recipe,
  isOpen,
  onClose,
  onConfirm
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !recipe) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="confirm-delete-title">
      <div className="modal-container confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon-wrapper" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D9381E" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </div>

        <h3 id="confirm-delete-title" className="confirm-title">
          Delete &ldquo;{recipe.title}&rdquo;?
        </h3>

        <p className="confirm-message">
          Are you sure you want to remove this recipe from your cookbook? This action cannot be undone.
        </p>

        <div className="confirm-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              onConfirm(recipe.id);
              onClose();
            }}
            id="btn-confirm-delete"
          >
            Delete Recipe
          </button>
        </div>
      </div>
    </div>
  );
}
