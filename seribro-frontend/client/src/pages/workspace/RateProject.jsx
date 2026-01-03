// src/pages/workspace/RateProject.jsx
// Rate Project Page - Phase 5.4.9 - Complete Implementation

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ratingApi from '../../apis/ratingApi';
import workspaceApi from '../../apis/workspaceApi';
import StarRating from '../../components/ratings/StarRating';
import { AlertCircle, Clock, CheckCircle2, ChevronLeft, ChevronDown, ChevronUp, Loader } from 'lucide-react';

const RateProject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // States
  const [project, setProject] = useState(null);
  const [existingRating, setExistingRating] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [guidelinesAccepted, setGuidelinesAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canEditRating, setCanEditRating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [successRedirect, setSuccessRedirect] = useState(false);
  const [isGuidelinesExpanded, setIsGuidelinesExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Rating labels
  const ratingLabels = {
    5: 'Excellent',
    4: 'Good',
    3: 'Average',
    2: 'Below Average',
    1: 'Poor',
  };

  // Load project and rating data
  useEffect(() => {
    const loadProjectData = async () => {
      try {
        const res = await workspaceApi.getWorkspaceOverview(projectId);
        if (res.success) {
          setProject(res.data.project);
          setUserRole(res.data.workspace?.role);

          // Load existing rating if any
          const ratingRes = await ratingApi.getProjectRating(projectId);
          if (ratingRes.success && ratingRes.data?.rating) {
            const ratingData = ratingRes.data.rating;

            // Determine which rating belongs to current user
            if (res.data.workspace?.role === 'company' && ratingData.companyRating) {
              setExistingRating(ratingData.companyRating);
              setRating(ratingData.companyRating.rating);
              setReview(ratingData.companyRating.review || '');
              setGuidelinesAccepted(true); // Already accepted when first submitting

              // Check if edit is within 24 hours
              const ratedAt = new Date(ratingData.companyRating.ratedAt);
              const now = new Date();
              const diffHours = (now - ratedAt) / (1000 * 60 * 60);
              setCanEditRating(diffHours < 24);

              if (diffHours < 24) {
                const remaining = Math.ceil((24 - diffHours) * 60);
                setTimeLeft(remaining);
              }
            } else if (res.data.workspace?.role === 'student' && ratingData.studentRating) {
              setExistingRating(ratingData.studentRating);
              setRating(ratingData.studentRating.rating);
              setReview(ratingData.studentRating.review || '');
              setGuidelinesAccepted(true); // Already accepted when first submitting

              // Check if edit is within 24 hours
              const ratedAt = new Date(ratingData.studentRating.ratedAt);
              const now = new Date();
              const diffHours = (now - ratedAt) / (1000 * 60 * 60);
              setCanEditRating(diffHours < 24);

              if (diffHours < 24) {
                const remaining = Math.ceil((24 - diffHours) * 60);
                setTimeLeft(remaining);
              }
            }
          }
        } else {
          alert(String(res?.message || 'Failed to load project'));
        }
      } catch (error) {
        console.error('Error loading project:', error);
        alert('Error loading project data');
      } finally {
        setLoading(false);
      }
    };

    loadProjectData();
  }, [projectId]);

  // Countdown timer for edit window
  useEffect(() => {
    if (!timeLeft || !canEditRating) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanEditRating(false);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [timeLeft, canEditRating]);

  // Handle rating submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!guidelinesAccepted) {
      alert('Please accept the guidelines before submitting');
      return;
    }

    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    if (review.trim().length < 10) {
      alert('Review must be at least 10 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      let res;
      if (userRole === 'company') {
        res = await ratingApi.rateStudent(projectId, { rating, review });
      } else if (userRole === 'student') {
        res = await ratingApi.rateCompany(projectId, { rating, review });
      } else {
        alert('Unauthorized to rate');
        setIsSubmitting(false);
        return;
      }

      if (res.success) {
        setSuccessRedirect(true);
        alert('Rating submitted successfully! Redirecting...');

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate(`/workspace/projects/${projectId}`, { replace: true });
        }, 2000);
      } else {
        alert(String(res?.message || 'Failed to submit rating'));
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Error submitting rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get placeholder text based on role
  const getPlaceholder = () => {
    if (userRole === 'student') {
      return 'Was the work delivered on time? Was quality satisfactory? Was communication professional?';
    }
    return 'Was the project description accurate? Was communication clear? Were payments timely?';
  };

  // Format time left for display
  const formatTimeLeft = (minutes) => {
    if (!minutes) return '0 minutes';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Handle edit button click
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reload original values
    if (existingRating) {
      setRating(existingRating.rating);
      setReview(existingRating.review || '');
      setGuidelinesAccepted(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} className="animate-spin text-amber-400 mx-auto mb-4" />
          <p className="text-gray-300">Loading project...</p>
        </div>
      </div>
    );
  }

  if (successRedirect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle2 size={64} className="text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Rating Submitted!</h2>
          <p className="text-gray-300">Redirecting to project...</p>
        </div>
      </div>
    );
  }

  // Show read-only view when rating exists and user is not editing
  if (existingRating && !isEditing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
            >
              <ChevronLeft size={20} />
              Back
            </button>
            <h1 className="text-3xl font-bold text-white">Your Rating</h1>
            <p className="text-gray-400 mt-2">View and manage your feedback</p>
          </div>

          {/* Read-Only Rating View */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Project Summary */}
            <div className="lg:col-span-1">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-4">
                <h2 className="text-lg font-semibold text-white mb-4">Project Summary</h2>
                
                {project && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Project Title</p>
                      <p className="text-white font-medium mt-1">{project.title}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Status</p>
                      <div className="mt-1">
                        <span className="inline-block px-3 py-1 bg-green-500/20 border border-green-500 text-green-300 text-xs rounded-full font-medium">
                          Completed
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">
                        {userRole === 'company' ? 'Student' : 'Company'}
                      </p>
                      <p className="text-white font-medium mt-1">
                        {userRole === 'company'
                          ? project.studentName || 'Unknown'
                          : project.companyName || 'Unknown'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Amount</p>
                      <p className="text-white font-medium mt-1">
                        ${project.budget || project.stipend || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Duration</p>
                      <p className="text-white font-medium mt-1">
                        {project.duration ? `${project.duration} days` : 'N/A'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Rating Display */}
            <div className="lg:col-span-2">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-6">
                {/* Success Message */}
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex gap-3">
                  <CheckCircle2 size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-200 font-medium">You rated this project</p>
                    <p className="text-green-300 text-sm mt-1">
                      Rated on {existingRating.ratedAt ? new Date(existingRating.ratedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Edit Window Notice */}
                {canEditRating && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex gap-3">
                    <Clock size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-blue-200 font-medium">You can still edit your rating</p>
                      <p className="text-blue-300 text-sm mt-1">
                        You have {formatTimeLeft(timeLeft)} left to edit
                      </p>
                    </div>
                  </div>
                )}

                {/* Read-Only Star Rating */}
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-200 mb-4">Your Rating</p>
                  <StarRating
                    rating={rating}
                    onChange={() => {}}
                    readOnly={true}
                    size="lg"
                  />
                  <p className="text-sm text-gray-400 mt-3 font-medium">
                    {ratingLabels[rating]} ({rating}/5)
                  </p>
                </div>

                {/* Read-Only Review */}
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-200 mb-3">Your Review</p>
                  <p className="text-gray-300 leading-relaxed">{review}</p>
                  <p className="text-xs text-gray-500 mt-3">{review.length} characters</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  {canEditRating && (
                    <button
                      onClick={handleEditClick}
                      className="flex-1 py-3 px-4 rounded-lg font-medium bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 hover:shadow-lg hover:shadow-amber-500/50 active:scale-95 transition-all"
                    >
                      Edit Rating
                    </button>
                  )}
                  <button
                    onClick={() => navigate(-1)}
                    className="flex-1 py-3 px-4 rounded-lg font-medium bg-slate-700 text-white hover:bg-slate-600 transition-colors"
                  >
                    Back to Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ChevronLeft size={20} />
            Back
          </button>
          <h1 className="text-3xl font-bold text-white">
            Rate {userRole === 'company' ? project?.studentName : project?.companyName}
          </h1>
          <p className="text-gray-400 mt-2">Share your feedback about this project</p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Project Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden sticky top-8">
              <div className="bg-gradient-to-br from-amber-400/10 to-amber-500/5 border-b border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Project Summary</h2>
                
                {project && (
                  <div className="space-y-5">
                    {/* Project Title */}
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Title</p>
                      <p className="text-white font-medium mt-2">{project.title}</p>
                    </div>

                    {/* Completion Status */}
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Status</p>
                      <div className="mt-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 border border-green-500 text-green-300 text-xs rounded-full font-medium">
                          <CheckCircle2 size={14} />
                          Completed
                        </span>
                      </div>
                    </div>

                    {/* Participant */}
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                        {userRole === 'company' ? 'Student' : 'Company'}
                      </p>
                      <p className="text-white font-medium mt-2">
                        {userRole === 'company'
                          ? project.studentName || 'Unknown'
                          : project.companyName || 'Unknown'}
                      </p>
                    </div>

                    {/* Final Amount */}
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Amount</p>
                      <p className="text-white font-medium mt-2 text-lg">
                        ${project.budget || project.stipend || 'N/A'}
                      </p>
                    </div>

                    {/* Duration */}
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Duration</p>
                      <p className="text-white font-medium mt-2">
                        {project.duration ? `${project.duration} days` : 'N/A'}
                      </p>
                    </div>

                    {/* Quick Highlights */}
                    {project.description && (
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">About</p>
                        <p className="text-gray-300 text-sm mt-2 line-clamp-3">
                          {project.description}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Rating Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Existing Rating Notice - Update Mode */}
              {existingRating && isEditing && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex gap-3">
                  <Clock size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-200 font-medium">Editing your rating</p>
                    <p className="text-blue-300 text-sm mt-1">
                      You have {formatTimeLeft(timeLeft)} left to make changes
                    </p>
                  </div>
                </div>
              )}

              {/* Star Rating Section */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <div className="space-y-4">
                  <StarRating
                    rating={rating}
                    onChange={setRating}
                    readOnly={!canEditRating && existingRating && !isEditing}
                    size="lg"
                    label={`Rate ${userRole === 'company' ? project?.studentName : project?.companyName}`}
                    required
                  />

                  {/* Rating Labels */}
                  {rating > 0 && (
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Your Rating</p>
                          <p className="text-lg font-bold text-white mt-1">
                            {ratingLabels[rating]}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-amber-400">{rating}</p>
                          <p className="text-xs text-gray-400">out of 5</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-gray-400 mt-3">
                    {userRole === 'company'
                      ? 'Rate this student based on work quality, professionalism, and communication'
                      : 'Rate this company based on project clarity, communication, and payment reliability'}
                  </p>
                </div>
              </div>

              {/* Review Textarea */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <label className="block text-sm font-semibold text-gray-200 mb-3">
                  Share Your Experience <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value.slice(0, 1000))}
                  placeholder={getPlaceholder()}
                  className="w-full p-4 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-gray-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all resize-none"
                  rows={6}
                  disabled={!canEditRating && existingRating && !isEditing}
                  maxLength={1000}
                />
                <div className="flex justify-between items-center mt-3">
                  <p className="text-xs text-gray-400">
                    {review.length} / 1000 characters
                  </p>
                  <p className={`text-xs font-medium ${
                    review.trim().length >= 10 ? 'text-green-400' : 'text-amber-400'
                  }`}>
                    {review.trim().length < 10 
                      ? `${10 - review.trim().length} more needed`
                      : 'Ready to submit'}
                  </p>
                </div>
              </div>

              {/* Guidelines Section - Collapsible */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsGuidelinesExpanded(!isGuidelinesExpanded)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-700/30 transition-colors"
                >
                  <h3 className="text-sm font-semibold text-white">Rating Guidelines</h3>
                  <div className="text-gray-400">
                    {isGuidelinesExpanded ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </div>
                </button>

                {isGuidelinesExpanded && (
                  <>
                    <div className="border-t border-slate-700 px-6 py-4">
                      <ul className="text-sm text-gray-300 space-y-3">
                        <li className="flex gap-3">
                          <span className="text-amber-400 font-bold flex-shrink-0">✓</span>
                          <span><strong>Be honest and constructive</strong> in your feedback</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-amber-400 font-bold flex-shrink-0">✓</span>
                          <span><strong>Focus on facts, not emotions</strong> – discuss specific situations</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-amber-400 font-bold flex-shrink-0">✓</span>
                          <span><strong>Ratings are visible to others</strong> in the community and on profiles</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-amber-400 font-bold flex-shrink-0">✓</span>
                          <span><strong>You can edit within 24 hours</strong> of submission</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-amber-400 font-bold flex-shrink-0">✓</span>
                          <span><strong>Avoid discriminatory language</strong> or personal attacks</span>
                        </li>
                      </ul>
                    </div>

                    <div className="border-t border-slate-700 px-6 py-4 bg-slate-900/30">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={guidelinesAccepted}
                          onChange={(e) => setGuidelinesAccepted(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-amber-400 focus:ring-2 focus:ring-amber-400/20 mt-1 flex-shrink-0"
                          disabled={!canEditRating && existingRating && !isEditing}
                        />
                        <span className="text-sm text-gray-300">
                          I confirm this rating reflects my <strong>actual experience</strong> and I have read the guidelines
                        </span>
                      </label>
                    </div>
                  </>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    (!canEditRating && existingRating && !isEditing) ||
                    !guidelinesAccepted ||
                    rating === 0 ||
                    review.trim().length < 10
                  }
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                    isSubmitting ||
                    (!canEditRating && existingRating && !isEditing) ||
                    !guidelinesAccepted ||
                    rating === 0 ||
                    review.trim().length < 10
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 hover:shadow-lg hover:shadow-amber-500/50 active:scale-95'
                  }`}
                >
                  {isSubmitting && <Loader size={18} className="animate-spin" />}
                  {isSubmitting ? 'Submitting...' : existingRating && isEditing ? 'Update Rating' : 'Submit Rating'}
                </button>

                {isEditing && existingRating && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="py-3 px-6 rounded-lg font-medium bg-slate-700 text-white hover:bg-slate-600 transition-colors"
                  >
                    Cancel Edit
                  </button>
                )}

                {!isEditing && !existingRating && (
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="py-3 px-6 rounded-lg font-medium bg-slate-700 text-white hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Impact</p>
            <p className="text-white font-semibold">Help Build Trust</p>
            <p className="text-sm text-gray-400 mt-2">Your honest feedback helps others make informed decisions</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Visibility</p>
            <p className="text-white font-semibold">Public Ratings</p>
            <p className="text-sm text-gray-400 mt-2">Your review is visible on profiles and project pages</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Flexibility</p>
            <p className="text-white font-semibold">24-Hour Edit Window</p>
            <p className="text-sm text-gray-400 mt-2">Change your rating anytime within 24 hours</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateProject;