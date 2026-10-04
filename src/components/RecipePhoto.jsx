import React, { useState } from 'react';

/**
 * Recipe photograph with a plain, honest fallback.
 * If there is no image URL, or it fails to load, a neutral labelled block is shown.
 */
export default function RecipePhoto({ src, alt, label, className = '', eager = false, ...rest }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const failed = !src || failedSrc === src;

  if (failed) {
    return (
      <div className={`photo-fallback ${className}`} role="img" aria-label={`${label || alt || 'Recipe'} — no photo available`}>
        <span>{label || 'No photo'}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || ''}
      className={className}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailedSrc(src)}
      {...rest}
    />
  );
}
