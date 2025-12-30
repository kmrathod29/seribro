// src/components/ratings/RatingDisplay.jsx
// Read-only Rating Display Component - Phase 5.4.9

import React, { useState } from 'react';
import { Star, TrendingUp } from 'lucide-react';

const RatingDisplay = ({
  rating = 0,
  reviewCount = 0,
  distribution = null,
  showDistribution = true,
  size = 'md',
  showLabel = true,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Size mapping
  const sizeMap = {
    sm: { icon: 14, gap: 'gap-0.5', text: 'text-xs', label: 'text-xs' },
    md: { icon: 20, gap: 'gap-1', text: 'text-sm', label: 'text-sm' },
    lg: { icon: 28, gap: 'gap-2', text: 'text-base', label: 'text-base' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const fullStars = Math.floor(rating);
  const partialFill = (rating % 1) * 100; // Percentage fill for partial star

  // Format rating display
  const displayRating = rating.toFixed(1);

  // Distribution tooltip content
  const renderDistribution = () => {
    if (!distribution || !showDistribution) return null;

    return (
      <div className="space-y-1">
        {[5, 4, 3, 2, 1].map((stars) => (
          <div key={stars} className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[...Array(stars)].map((_, i) => (
                <Star key={i} size={12} fill="#fbbf24" stroke="none" />
              ))}
            </div>
            <span className="text-xs text-gray-300">
              {distribution[`${stars}star`] || 0} reviews
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {/* Rating Stars */}
        <div className={`flex items-center ${currentSize.gap}`}>
          {[0, 1, 2, 3, 4].map((index) => {
            const isFilled = index < fullStars;
            const isPartial = index === fullStars && partialFill > 0;

            return (
              <div key={index} className="relative inline-block">
                {/* Background (empty) star */}
                <Star
                  size={currentSize.icon}
                  className="text-gray-500"
                  fill="none"
                  strokeWidth={2}
                />

                {/* Filled star (or partial) */}
                {(isFilled || isPartial) && (
                  <div
                    className="absolute top-0 left-0 overflow-hidden"
                    style={{
                      width: isFilled ? '100%' : `${partialFill}%`,
                    }}
                  >
                    <Star
                      size={currentSize.icon}
                      fill="#fbbf24"
                      stroke="#fbbf24"
                      className="text-amber-400"
                      strokeWidth={2}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Rating Number */}
        <span className={`${currentSize.label} font-semibold text-amber-400`}>
          {displayRating}
        </span>
      </div>

      {/* Review Count */}
      {showLabel && reviewCount > 0 && (
        <div className="relative">
          <button
            type="button"
            onMouseEnter={() => distribution && setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className={`${currentSize.text} text-gray-400 hover:text-gray-300 transition-colors text-left flex items-center gap-1`}
          >
            ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
            {distribution && <TrendingUp size={12} className="opacity-60" />}
          </button>

          {/* Distribution Tooltip */}
          {showTooltip && distribution && (
            <div className="absolute bottom-full left-0 mb-2 p-3 bg-slate-900 border border-slate-700 rounded shadow-lg z-10 whitespace-nowrap">
              {renderDistribution()}
            </div>
          )}
        </div>
      )}

      {/* No Ratings Yet */}
      {showLabel && reviewCount === 0 && (
        <p className={`${currentSize.text} text-gray-500 italic`}>
          No ratings yet
        </p>
      )}
    </div>
  );
};

export default RatingDisplay;
