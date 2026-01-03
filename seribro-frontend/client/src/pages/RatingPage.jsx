// src/pages/RatingPage.jsx
// Project Rating and Review Page

import React, { useState } from 'react';
import { Star, Send, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';

const RatingPage = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitRating = async () => {
    if (!rating) {
      alert('Please select a rating');
      return;
    }

    try {
      setSubmitting(true);
      // TODO: Call rating API endpoint
      // const res = await submitRating({ rating, review });
      
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitted(true);
      alert('Rating submitted successfully!');
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setRating(0);
        setReview('');
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      alert('Error submitting rating');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy/90 to-navy/70">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-white mb-2">Rate Your Project Experience</h1>
            <p className="text-gray-400">Help us improve by sharing your feedback</p>
          </div>

          {/* Rating Card */}
          <div className="bg-gradient-to-br from-navy/50 to-navy/30 border border-gold/20 rounded-lg p-8 mb-8">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-green-400 fill-current" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
                <p className="text-gray-400">Your rating has been submitted</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Rating Selection */}
                <div>
                  <label className="block text-lg font-semibold text-white mb-6">
                    How would you rate your project?
                  </label>
                  <div className="flex gap-4 justify-center">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        onClick={() => setRating(value)}
                        onMouseEnter={() => setHoverRating(value)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          size={48}
                          className={`${
                            (hoverRating || rating) >= value
                              ? 'fill-gold text-gold'
                              : 'text-gray-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-center text-gold mt-4 font-semibold">
                      {rating === 5 && 'Excellent!'}
                      {rating === 4 && 'Great!'}
                      {rating === 3 && 'Good'}
                      {rating === 2 && 'Fair'}
                      {rating === 1 && 'Poor'}
                    </p>
                  )}
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-lg font-semibold text-gray-300 mb-3">
                    Write Your Review (Optional)
                  </label>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Share your experience with this project... (min 10 characters)"
                    maxLength={500}
                    rows={6}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {review.length}/500 characters
                  </p>
                </div>

                {/* Review Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-gold">{rating}</p>
                    <p className="text-xs text-gray-400">out of 5</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-gold">{review.length}</p>
                    <p className="text-xs text-gray-400">characters</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 text-center">
                    <p className={`text-2xl font-bold ${review.length >= 10 ? 'text-green-400' : 'text-gray-500'}`}>
                      {review.length >= 10 ? '✓' : '-'}
                    </p>
                    <p className="text-xs text-gray-400">required</p>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitRating}
                  disabled={submitting || !rating}
                  className="w-full py-3 bg-gold hover:bg-gold/90 text-navy font-semibold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <span className="animate-spin">⟳</span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Rating
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Rating Criteria */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Rating Guide</h3>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex gap-3">
                <Star size={16} className="text-yellow-400 fill-current flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">5 Stars - Excellent</p>
                  <p>Exceeded expectations, would work again</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Star size={16} className="text-yellow-400 fill-current flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">4 Stars - Great</p>
                  <p>Very satisfied with the work quality</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Star size={16} className="text-gray-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">3 Stars - Good</p>
                  <p>Satisfied but with minor issues</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Star size={16} className="text-gray-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">2 Stars - Fair</p>
                  <p>Some concerns about quality or communication</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Star size={16} className="text-gray-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">1 Star - Poor</p>
                  <p>Not satisfied, significant issues</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-200">
              Your rating is important for maintaining quality standards. All ratings are reviewed by our team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingPage;
