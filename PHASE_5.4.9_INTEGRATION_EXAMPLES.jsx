// PHASE_5.4.9_INTEGRATION_EXAMPLES.jsx
// Integration Examples for Rating Components - Phase 5.4.9

// ============================================================
// EXAMPLE 1: Using StarRating in a Custom Form
// ============================================================

import React, { useState } from 'react';
import { StarRating } from '@/components/ratings';

const ProjectFeedbackForm = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = async () => {
    // Your submission logic
    console.log('Rating:', rating, 'Comment:', comment);
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <StarRating
        rating={rating}
        onChange={setRating}
        size="lg"
        label="How was your experience?"
        required
      />

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your thoughts..."
      />

      <button
        type="submit"
        disabled={rating === 0 || !comment}
      >
        Submit
      </button>
    </form>
  );
};

// ============================================================
// EXAMPLE 2: Displaying User Profile Rating
// ============================================================

import { RatingDisplay } from '@/components/ratings';

const StudentProfileCard = ({ student }) => {
  return (
    <div className="profile-card">
      <h2>{student.name}</h2>
      <p>{student.email}</p>

      {student.ratings?.averageRating > 0 ? (
        <RatingDisplay
          rating={student.ratings.averageRating}
          reviewCount={student.ratings.totalReviews}
          size="md"
        />
      ) : (
        <p>No ratings yet</p>
      )}
    </div>
  );
};

// ============================================================
// EXAMPLE 3: Rating Modal for Project Completion
// ============================================================

import { useState } from 'react';
import { StarRating } from '@/components/ratings';

const ProjectCompleteModal = ({ project, onRate }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onRate({ rating, review });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <h3>Rate {project.title}</h3>

      <StarRating
        rating={rating}
        onChange={setRating}
        size="lg"
        label="How would you rate this project?"
      />

      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder="Optional review..."
        rows={4}
      />

      <button
        onClick={handleSubmit}
        disabled={rating === 0 || loading}
      >
        {loading ? 'Submitting...' : 'Submit Rating'}
      </button>
    </div>
  );
};

// ============================================================
// EXAMPLE 4: Leaderboard with Rating Display
// ============================================================

import { RatingDisplay } from '@/components/ratings';

const TopStudentsLeaderboard = ({ students }) => {
  return (
    <div className="leaderboard">
      <h2>Top Rated Students</h2>
      <ul>
        {students.map((student) => (
          <li key={student._id} className="leaderboard-item">
            <div className="student-info">
              <h4>{student.name}</h4>
              <p>{student.college}</p>
            </div>

            <RatingDisplay
              rating={student.ratings?.averageRating || 0}
              reviewCount={student.ratings?.totalReviews || 0}
              size="sm"
              showLabel={true}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

// ============================================================
// EXAMPLE 5: Company Profile with Rating Distribution
// ============================================================

import { RatingDisplay } from '@/components/ratings';

const CompanyProfilePage = ({ company }) => {
  const ratingDistribution = {
    "5star": 15,
    "4star": 8,
    "3star": 2,
    "2star": 0,
    "1star": 0
  };

  return (
    <div className="company-profile">
      <h1>{company.name}</h1>
      <p>{company.description}</p>

      <section className="rating-section">
        <h3>Rating & Reviews</h3>
        <RatingDisplay
          rating={company.ratings?.averageRating || 0}
          reviewCount={company.ratings?.totalReviews || 0}
          distribution={ratingDistribution}
          size="lg"
        />
      </section>
    </div>
  );
};

// ============================================================
// EXAMPLE 6: Using StarRating in Read-only Mode
// ============================================================

import { StarRating } from '@/components/ratings';

const ReviewCard = ({ review }) => {
  return (
    <div className="review-card">
      <div className="review-header">
        <h4>{review.authorName}</h4>
        <p className="review-date">{formatDate(review.createdAt)}</p>
      </div>

      {/* Read-only star rating display */}
      <StarRating
        rating={review.rating}
        readOnly={true}
        size="sm"
      />

      <p className="review-text">{review.text}</p>
    </div>
  );
};

// ============================================================
// EXAMPLE 7: Filtering by Rating
// ============================================================

import { useState } from 'react';
import { StarRating, RatingDisplay } from '@/components/ratings';

const ProjectFilterByRating = ({ projects }) => {
  const [minRating, setMinRating] = useState(0);

  const filteredProjects = projects.filter(
    (project) =>
      !project.ratings || project.ratings.averageRating >= minRating
  );

  return (
    <div>
      <div className="filter-section">
        <label>Minimum Rating:</label>
        <StarRating
          rating={minRating}
          onChange={setMinRating}
          size="md"
          label="Filter by rating"
        />
      </div>

      <div className="projects-grid">
        {filteredProjects.map((project) => (
          <div key={project._id} className="project-card">
            <h3>{project.title}</h3>

            <RatingDisplay
              rating={project.ratings?.averageRating || 0}
              reviewCount={project.ratings?.totalReviews || 0}
              size="md"
            />

            <p>{project.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// EXAMPLE 8: API Integration for Ratings
// ============================================================

import ratingApi from '@/apis/ratingApi';

const RatingIntegrationExample = () => {
  const [projectRating, setProjectRating] = useState(null);

  // Fetch project rating
  const fetchProjectRating = async (projectId) => {
    const response = await ratingApi.getProjectRating(projectId);
    if (response.success) {
      setProjectRating(response.data?.rating);
    }
  };

  // Submit a rating
  const submitRating = async (projectId, rating, review) => {
    const response = await ratingApi.rateStudent(projectId, {
      rating,
      review
    });
    if (response.success) {
      // Update UI or refetch data
      await fetchProjectRating(projectId);
    }
  };

  // Get user's ratings given
  const fetchUserRatings = async (userId) => {
    const response = await ratingApi.getUserRatings(userId);
    if (response.success) {
      console.log('User ratings given:', response.data?.ratings);
    }
  };

  return (
    <div>
      {/* Your component content */}
    </div>
  );
};

// ============================================================
// EXAMPLE 9: Responsive Rating Display Grid
// ============================================================

import { RatingDisplay } from '@/components/ratings';

const StudentGridWithRatings = ({ students }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {students.map((student) => (
        <div
          key={student._id}
          className="bg-slate-800 border border-slate-700 rounded-lg p-4"
        >
          <h3 className="text-white font-semibold mb-2">{student.name}</h3>
          <p className="text-gray-400 text-sm mb-4">{student.college}</p>

          {/* Rating display changes size based on screen */}
          <RatingDisplay
            rating={student.ratings?.averageRating || 0}
            reviewCount={student.ratings?.totalReviews || 0}
            size="md"
            showLabel={true}
          />
        </div>
      ))}
    </div>
  );
};

// ============================================================
// EXAMPLE 10: Complete Rating Workflow
// ============================================================

import { useState, useEffect } from 'react';
import { StarRating, RatingDisplay } from '@/components/ratings';
import ratingApi from '@/apis/ratingApi';

const CompleteRatingWorkflow = ({ projectId, userRole }) => {
  const [step, setStep] = useState('display'); // display, rate, success
  const [existingRating, setExistingRating] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  useEffect(() => {
    fetchProjectRating();
  }, [projectId]);

  const fetchProjectRating = async () => {
    const response = await ratingApi.getProjectRating(projectId);
    if (response.success && response.data?.rating) {
      setExistingRating(response.data.rating);
    }
  };

  const handleSubmitRating = async () => {
    const endpoint =
      userRole === 'company'
        ? ratingApi.rateStudent
        : ratingApi.rateCompany;

    const response = await endpoint(projectId, { rating, review });
    if (response.success) {
      setStep('success');
      await fetchProjectRating();
    }
  };

  if (step === 'display' && existingRating) {
    return (
      <div>
        <h3>Project Rating</h3>
        <RatingDisplay
          rating={existingRating.rating}
          reviewCount={1}
          size="lg"
        />
        <p>{existingRating.review}</p>
        <button onClick={() => setStep('rate')}>Edit Rating</button>
      </div>
    );
  }

  if (step === 'rate') {
    return (
      <div>
        <h3>Rate This Project</h3>
        <StarRating
          rating={rating}
          onChange={setRating}
          size="lg"
          label="Your Rating"
        />

        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Your review..."
          rows={5}
        />

        <button onClick={handleSubmitRating}>Submit</button>
        <button onClick={() => setStep('display')}>Cancel</button>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="success-message">
        <h3>Rating Submitted!</h3>
        <p>Thank you for your feedback.</p>
        <button onClick={() => setStep('display')}>Back</button>
      </div>
    );
  }

  return (
    <div>
      <h3>Rate This Project</h3>
      <StarRating
        rating={rating}
        onChange={setRating}
        size="lg"
        label="Your Rating"
      />

      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder="Your review..."
        rows={5}
      />

      <button onClick={handleSubmitRating}>Submit</button>
    </div>
  );
};

export {
  ProjectFeedbackForm,
  StudentProfileCard,
  ProjectCompleteModal,
  TopStudentsLeaderboard,
  CompanyProfilePage,
  ReviewCard,
  ProjectFilterByRating,
  RatingIntegrationExample,
  StudentGridWithRatings,
  CompleteRatingWorkflow
};
