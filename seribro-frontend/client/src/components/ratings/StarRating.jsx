// src/components/ratings/StarRating.jsx
// Interactive Star Rating Component - Phase 5.4.9

import React, { useState, useRef } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({
  rating = 0,
  onChange = () => {},
  readOnly = false,
  size = 'md',
  label = '',
  required = false,
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef(null);

  // Size mapping
  const sizeMap = {
    sm: { icon: 16, gap: 'gap-0.5', text: 'text-xs' },
    md: { icon: 24, gap: 'gap-1', text: 'text-sm' },
    lg: { icon: 32, gap: 'gap-2', text: 'text-base' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const displayRating = hoverRating || rating;

  // Handle click
  const handleStarClick = (index) => {
    if (!readOnly) {
      const newRating = index + 1;
      onChange(newRating);
    }
  };

  // Handle mouse enter
  const handleStarHover = (index) => {
    if (!readOnly) {
      setHoverRating(index + 1);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (readOnly) return;

    let newRating = rating;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      newRating = Math.min(rating + 1, 5);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      newRating = Math.max(rating - 1, 0);
      e.preventDefault();
    } else if (e.key === 'Enter' || e.key === ' ') {
      // Keep current rating, just prevent default
      e.preventDefault();
      return;
    }

    if (newRating !== rating) {
      onChange(newRating);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className={`block ${currentSize.text} font-medium text-gray-200`}>
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div
        ref={containerRef}
        className={`flex items-center ${currentSize.gap} ${!readOnly ? 'cursor-pointer' : ''}`}
        onMouseLeave={() => !readOnly && setHoverRating(0)}
        tabIndex={!readOnly ? 0 : -1}
        onKeyDown={handleKeyDown}
        role="slider"
        aria-label={`Rating: ${rating} out of 5 stars${!readOnly ? ', use arrow keys to change' : ''}`}
        aria-valuenow={rating}
        aria-valuemin={0}
        aria-valuemax={5}
      >
        {[0, 1, 2, 3, 4].map((index) => {
          const isFilled = index < displayRating;

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleStarClick(index)}
              onMouseEnter={() => handleStarHover(index)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(-1)}
              disabled={readOnly}
              className={`
                relative transition-all duration-150
                ${isFilled ? 'text-amber-400' : 'text-gray-400'}
                ${!readOnly && 'hover:text-amber-300 active:scale-110'}
                ${focusedIndex === index && !readOnly ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900 rounded-full' : ''}
                disabled:cursor-not-allowed
                focus:outline-none
              `}
              aria-label={`${index + 1} stars`}
              title={`${index + 1} stars`}
            >
              <Star
                size={currentSize.icon}
                fill={isFilled ? 'currentColor' : 'none'}
                strokeWidth={2}
              />
            </button>
          );
        })}
      </div>

      {rating > 0 && (
        <p className={`${currentSize.text} text-amber-400 font-medium`}>
          {rating.toFixed(1)} out of 5 stars
        </p>
      )}
    </div>
  );
};

export default StarRating;
