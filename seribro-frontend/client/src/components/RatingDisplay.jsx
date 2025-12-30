// frontend/src/components/RatingDisplay.jsx
// RatingDisplay Component - Shows average rating and review count

import React from 'react';
import { Star } from 'lucide-react';

const RatingDisplay = ({ 
    averageRating = 0, 
    totalRatings = 0, 
    size = 'md',
    showLabel = true,
    className = ''
}) => {
    // Determine size styles
    const sizes = {
        sm: { star: 14, text: 'text-xs' },
        md: { star: 18, text: 'text-sm' },
        lg: { star: 24, text: 'text-lg' }
    };

    const sizeConfig = sizes[size] || sizes.md;
    const displayRating = Math.round(averageRating * 10) / 10;

    const renderStars = () => {
        const stars = [];
        const fullStars = Math.floor(displayRating);
        const hasHalfStar = displayRating % 1 !== 0;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(
                    <div key={i} className="relative">
                        <Star 
                            size={sizeConfig.star} 
                            className="fill-gold text-gold" 
                        />
                    </div>
                );
            } else if (i === fullStars && hasHalfStar) {
                stars.push(
                    <div key={i} className="relative">
                        <Star 
                            size={sizeConfig.star} 
                            className="fill-gray-400 text-gray-400" 
                        />
                        <div className="absolute top-0 left-0 overflow-hidden" style={{ width: '50%' }}>
                            <Star 
                                size={sizeConfig.star} 
                                className="fill-gold text-gold" 
                            />
                        </div>
                    </div>
                );
            } else {
                stars.push(
                    <div key={i} className="relative">
                        <Star 
                            size={sizeConfig.star} 
                            className="fill-gray-400 text-gray-400" 
                        />
                    </div>
                );
            }
        }

        return stars;
    };

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* Stars */}
            <div className="flex gap-1">
                {renderStars()}
            </div>

            {/* Rating Info */}
            {showLabel && (
                <div className={`${sizeConfig.text}`}>
                    <span className="font-semibold text-white">
                        {displayRating}
                    </span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className="text-gray-400">
                        {totalRatings} {totalRatings === 1 ? 'review' : 'reviews'}
                    </span>
                </div>
            )}
        </div>
    );
};

export default RatingDisplay;
