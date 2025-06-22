
// components/ReviewSection.tsx
import React, { useState, useCallback } from 'react';

const ReviewForm = ({
  onSubmit, isSubmitting, submitError }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (rating === 0 || !comment.trim()) return;

    try {
      await onSubmit({ rating, comment: comment.trim(), imageFile });
      // Reset form on success
      setRating(0);
      setComment("");
      setImageFile(null);
    } catch (error) {
      // Error handling is done in parent component
    }
  }, [rating, comment, imageFile, onSubmit]);

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <div className="form-group">
        <label htmlFor="rating" className="form-label">Rating *</label>
        <select
          id="rating"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          required
          className="form-select"
          disabled={isSubmitting}
        >
          <option value={0}>Select rating (1–5)</option>
          {[1, 2, 3, 4, 5].map((num) => (
            <option key={num} value={num}>
              {num} Star{num > 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="comment" className="form-label">Review *</label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your review..."
          required
          className="form-textarea"
          rows={4}
          disabled={isSubmitting}
          maxLength={1000}
        />
        <small className="form-help">
          {comment.length}/1000 characters
        </small>
      </div>

      <div className="form-group">
        <label htmlFor="image" className="form-label">Image (optional)</label>
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="form-file"
          disabled={isSubmitting}
        />
      </div>

      {submitError && (
        <div className="form-error" role="alert">
          {submitError}
        </div>
      )}

      <button 
        type="submit" 
        className="submit-button"
        disabled={isSubmitting || rating === 0 || !comment.trim()}
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
};

const StarRating = ({ rating }) => {
  const stars = Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={`star ${i < rating ? 'filled' : 'empty'}`}>
      {i < rating ? '★' : '☆'}
    </span>
  ));

  return <span className="star-rating"> {stars}</span>;
};

const ReviewSection = ({
  reviews,
  averageRating,
  user,
  hasPurchased,
  onReviewSubmit,
  isSubmitting,
  submitError,
  loading
}) => {
  const renderReviewForm = () => {
    if (!user) {
      return (
        <div className="review-prompt">
          <p>Please log in to leave a review.</p>
        </div>
      );
    }

    if (!hasPurchased) {
      return (
        <div className="review-prompt">
          <p>You must purchase this product to leave a review.</p>
        </div>
      );
    }

    return (
      <ReviewForm
        onSubmit={onReviewSubmit}
        isSubmitting={isSubmitting}
        submitError={submitError}
      />
    );
  };

  return (
    <div className="reviews-section">
      <h2 className="section-title">Customer Reviews</h2>

      {averageRating && (
        <div className="rating-summary">
          <StarRating rating={Math.round(parseFloat(averageRating))} />
          <span className="rating-text">
            {averageRating} / 5 ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
          </span>
        </div>
      )}

      {renderReviewForm()}

      <div className="reviews-list">
        {loading ? (
          <div className="reviews-loading">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="no-reviews">
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="review-item">
              <div className="review-header">
                <span className="review-author">{review.displayName}</span>
                <StarRating rating={review.rating} />
              </div>
              
              {review.imageUrl && (
                <div className="review-image">
                  <img 
                    src={review.imageUrl} 
                    alt="Review attachment" 
                    loading="lazy"
                  />
                </div>
              )}
              
              <p className="review-comment">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSection;