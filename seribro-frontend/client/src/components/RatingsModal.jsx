// frontend/src/components/RatingsModal.jsx
// RatingsModal Component - Display all ratings in an expandable modal

import React, { useState } from 'react';
import { X, Star, Calendar } from 'lucide-react';
import RatingDisplay from './RatingDisplay';

const RatingsModal = ({ 
    isOpen, 
    onClose, 
    ratings = [], 
    averageRating = 0,
    totalRatings = 0,
    userType = 'student' // 'student' or 'company'
}) => {
    const [sortBy, setSortBy] = useState('recent'); // 'recent' or 'rating'

    if (!isOpen) return null;

    const sortedRatings = [...ratings].sort((a, b) => {
        if (sortBy === 'recent') {
            return new Date(b.ratedAt) - new Date(a.ratedAt);
        } else {
            return b.rating - a.rating;
        }
    });

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const getRatingColor = (rating) => {
        if (rating >= 4.5) return 'text-green-400';
        if (rating >= 3.5) return 'text-blue-400';
        if (rating >= 2.5) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-navy border border-white/20 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-navy border-b border-white/20 p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            All Ratings & Reviews
                        </h2>
                        <RatingDisplay 
                            averageRating={averageRating}
                            totalRatings={totalRatings}
                            size="md"
                        />
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white/5 border-b border-white/20 p-4 flex gap-4">
                    <button
                        onClick={() => setSortBy('recent')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                            sortBy === 'recent'
                                ? 'bg-gold text-navy'
                                : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                    >
                        Most Recent
                    </button>
                    <button
                        onClick={() => setSortBy('rating')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                            sortBy === 'rating'
                                ? 'bg-gold text-navy'
                                : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                    >
                        Highest Rating
                    </button>
                </div>

                {/* Ratings List */}
                <div className="p-6 space-y-4">
                    {sortedRatings.length > 0 ? (
                        sortedRatings.map((rating, idx) => (
                            <div 
                                key={idx}
                                className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-300"
                            >
                                {/* Rating Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            {/* Stars */}
                                            <div className="flex gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={16}
                                                        className={i < rating.rating ? 'fill-gold text-gold' : 'fill-gray-400 text-gray-400'}
                                                    />
                                                ))}
                                            </div>
                                            <span className={`font-bold text-lg ${getRatingColor(rating.rating)}`}>
                                                {rating.rating.toFixed(1)}
                                            </span>
                                        </div>
                                        
                                        {/* Rater Info */}
                                        <p className="text-sm text-gray-400">
                                            By: <span className="text-white font-semibold">
                                                {rating.raterName || `${userType === 'student' ? 'Company' : 'Student'}`}
                                            </span>
                                        </p>
                                    </div>

                                    {/* Date */}
                                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                                        <Calendar size={14} />
                                        {formatDate(rating.ratedAt)}
                                    </div>
                                </div>

                                {/* Review Text */}
                                {rating.review && (
                                    <p className="text-gray-300 text-sm leading-relaxed bg-white/5 rounded p-3 border-l-2 border-gold">
                                        {rating.review}
                                    </p>
                                )}

                                {/* No Review Message */}
                                {!rating.review && (
                                    <p className="text-gray-500 text-sm italic">No review text provided</p>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <Star className="text-gray-600 mx-auto mb-3" size={40} />
                            <p className="text-gray-400 text-lg">No ratings yet</p>
                            <p className="text-gray-500 text-sm mt-1">
                                Complete projects to start receiving ratings
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RatingsModal;
