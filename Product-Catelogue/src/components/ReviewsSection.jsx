import React, { useState } from 'react';
import { getReviews, saveReview, savePainting, getPaintings } from '../utils/storage';

const ReviewsSection = ({ paintingId, currentUser }) => {
  const [reviews, setReviews] = useState(() => {
    const all = getReviews() || [];
    return all.filter(r => r.paintingId === paintingId);
  });
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newName, setNewName] = useState(currentUser ? currentUser.name : '');

  const handleHelpfulClick = (reviewId) => {
    const allReviews = getReviews() || [];
    const idx = allReviews.findIndex(r => r.id === reviewId);
    if (idx !== -1) {
      allReviews[idx].helpfulVotes = (allReviews[idx].helpfulVotes || 0) + 1;
      // Update local storage
      localStorage.setItem('starry_gallery_reviews', JSON.stringify(allReviews));
      // Update local state
      setReviews(allReviews.filter(r => r.paintingId === paintingId));
    }
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newRev = {
      id: `rev_${Date.now()}`,
      paintingId,
      userName: newName.trim() || 'Anonymous Collector',
      rating: newRating,
      comment: newComment.trim(),
      date: new Date().toISOString().split('T')[0],
      verified: currentUser ? true : false,
      helpfulVotes: 0,
      images: []
    };

    const updatedAll = saveReview(newRev);
    setReviews(updatedAll.filter(r => r.paintingId === paintingId));

    // Update painting average rating
    const pReviews = updatedAll.filter(r => r.paintingId === paintingId);
    const avgRating = pReviews.reduce((sum, r) => sum + r.rating, 0) / pReviews.length;

    const paintings = getPaintings() || [];
    const pIdx = paintings.findIndex(p => p.id === paintingId);
    if (pIdx !== -1) {
      paintings[pIdx].rating = Number(avgRating.toFixed(2));
      paintings[pIdx].reviewsCount = pReviews.length;
      savePainting(paintings[pIdx]);
    }

    // Reset Form
    setNewComment('');
    setNewRating(5);
    setShowAddForm(false);
    alert('Thank you for sharing your feedback on this masterpiece!');
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="reviews-wrapper glass-card">
      <div className="reviews-header-row">
        <div>
          <h3>Collector Feedback</h3>
          {reviews.length > 0 ? (
            <div className="rating-summary-row">
              <span className="avg-rating-num">{averageRating}</span>
              <span className="stars">{'★'.repeat(Math.round(averageRating))}{'☆'.repeat(5 - Math.round(averageRating))}</span>
              <span className="review-count-lbl">({reviews.length} Verified Reviews)</span>
            </div>
          ) : (
            <p>No reviews yet for this original artwork.</p>
          )}
        </div>

        <button className="gold-btn btn-sm" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel Review' : 'Write Review'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleReviewSubmit} className="add-review-form glass-panel">
          <h4>Leave a Review</h4>
          
          <div className="input-group">
            <label>Collector Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Baron de Rothschild"
            />
          </div>

          <div className="input-group">
            <label>Rating Selection</label>
            <div className="rating-star-selector">
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  onClick={() => setNewRating(star)}
                  className={`star-select ${star <= newRating ? 'selected' : ''}`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label>Comment / Review Text *</label>
            <textarea
              required
              rows="4"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your impressions of the artwork's depth, textures, framing, and presentation..."
            />
          </div>

          <button type="submit" className="gold-btn">Submit Review</button>
        </form>
      )}

      {/* Review List */}
      <div className="reviews-list-container">
        {reviews.map(r => (
          <div key={r.id} className="review-item-card">
            <div className="review-item-header">
              <div className="collector-meta">
                <span className="collector-name">{r.userName}</span>
                {r.verified && <span className="verified-badge">✓ Verified Buyer</span>}
              </div>
              <span className="review-date">{r.date}</span>
            </div>
            
            <div className="review-rating-row">
              <span className="item-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
            </div>

            <p className="review-comment-text">"{r.comment}"</p>

            <div className="review-item-footer">
              <span className="helpful-label">Was this review helpful?</span>
              <button className="helpful-btn" onClick={() => handleHelpfulClick(r.id)}>
                👍 Yes ({r.helpfulVotes || 0})
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsSection;
