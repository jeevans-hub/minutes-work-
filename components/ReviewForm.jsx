'use client';
import { useState } from 'react';

export default function ReviewForm({ bookingId, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return alert('Please select a rating');

    setSubmitting(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, review }),
      });

      if (res.ok) {
        onReviewSubmitted();
      } else {
        alert('Failed to submit review');
      }
    } catch (e) {
      console.error(e);
      alert('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-card p-8 animate-fade-in">
      <h3 className="text-xl font-bold mb-2">Rate your experience</h3>
      <p className="text-sm text-slate-400 mb-6">How was the service provided? Your feedback helps the community.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Rating */}
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="text-4xl transition-all hover:scale-110 focus:outline-none"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
            >
              <span className={(hover || rating) >= star ? 'text-amber-400' : 'text-slate-700'}>
                ★
              </span>
            </button>
          ))}
        </div>

        {/* Written Review */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Written Review (Optional)</label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Tell us more about the service..."
            className="input-field min-h-[120px] resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || rating === 0}
          className="btn-primary w-full py-4 text-lg justify-center shadow-lg shadow-indigo-500/20"
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}
