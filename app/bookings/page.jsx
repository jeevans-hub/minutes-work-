'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const STATUS_CONFIG = {
  pending: { color: 'badge-pending', icon: '⏳', label: 'Pending' },
  accepted: { color: 'badge-accepted', icon: '✅', label: 'Accepted' },
  inProgress: { color: 'badge-inProgress', icon: '🔄', label: 'In Progress' },
  completed: { color: 'badge-completed', icon: '🎉', label: 'Completed' },
  cancelled: { color: 'badge-cancelled', icon: '❌', label: 'Cancelled' },
  rejected: { color: 'badge-rejected', icon: '🚫', label: 'Rejected' },
};

function RatingModal({ booking, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await onSubmit(booking._id, rating, review);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card p-8 max-w-md w-full animate-fade-in">
        <h3 className="text-xl font-bold mb-2">Rate {booking.workerId?.name}</h3>
        <p className="text-slate-400 text-sm mb-6">How was your experience?</p>

        <div className="flex gap-2 justify-center mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setRating(i + 1)}
              onMouseEnter={() => setHover(i + 1)}
              onMouseLeave={() => setHover(0)}
              className="text-4xl transition-all hover:scale-110"
            >
              <span className={(hover || rating) > i ? 'text-amber-400' : 'text-slate-600'}>★</span>
            </button>
          ))}
        </div>

        <textarea
          className="input-field mb-4 resize-none min-h-[80px]"
          placeholder="Write a review (optional)..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSubmit} disabled={!rating || loading} className="btn-primary flex-1 justify-center">
            {loading ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [ratingModal, setRatingModal] = useState(null);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings);
      }
    } finally { setLoading(false); }
  };

  const cancelBooking = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    await fetch(`/api/bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    });
    fetchBookings();
  };

  const submitRating = async (id, rating, review) => {
    await fetch(`/api/bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, review }),
    });
    fetchBookings();
  };

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My <span className="gradient-text">Bookings</span></h1>
            <p className="text-slate-400 mt-1">Track all your service requests</p>
          </div>
          <Link href="/workers" className="btn-primary text-sm">+ New Booking</Link>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {['all', 'pending', 'accepted', 'inProgress', 'completed', 'cancelled'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                filter === s ? 'bg-indigo-600 text-white' : 'bg-slate-800/50 text-slate-400 hover:text-white'
              }`}
            >
              {s === 'all' ? 'All' : s === 'inProgress' ? 'In Progress' : s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-500">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-slate-400">No bookings found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((b) => {
              const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
              return (
                <div key={b._id} className="glass-card p-6 hover:border-indigo-500/20 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xl font-bold">
                        {b.workerId?.name?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{b.workerId?.name}</h3>
                        <p className="text-sm text-slate-400">{b.category} • {b.workerId?.email}</p>
                      </div>
                    </div>
                    <span className={`badge ${cfg.color}`}>{cfg.icon} {cfg.label}</span>
                  </div>

                  {b.description && (
                    <p className="text-sm text-slate-400 mb-3 bg-slate-800/30 rounded-lg p-3">{b.description}</p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-500 mb-4">
                    <div><span className="text-slate-400">📅 Booked:</span> {new Date(b.createdAt).toLocaleDateString()}</div>
                    <div><span className="text-slate-400">💳 Payment:</span> <span className="capitalize">{b.paymentType}</span></div>
                    {b.location?.address && <div className="col-span-2"><span className="text-slate-400">📍</span> {b.location.address}</div>}
                  </div>

                  {b.rating && (
                    <div className="flex items-center gap-2 text-sm mb-3">
                      <span className="text-slate-400">Your rating:</span>
                      <span className="text-amber-400">{'★'.repeat(b.rating)}</span>
                      {b.review && <span className="text-slate-500">"{b.review}"</span>}
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    {b.status === 'pending' && (
                      <button onClick={() => cancelBooking(b._id)} className="btn-danger text-sm py-1.5 px-4">
                        Cancel
                      </button>
                    )}
                    {b.status === 'completed' && !b.rating && (
                      <button onClick={() => setRatingModal(b)} className="btn-primary text-sm py-1.5 px-4">
                        ⭐ Rate Worker
                      </button>
                    )}
                    <Link href={`/bookings/${b._id}`} className="btn-secondary text-sm py-1.5 px-4">
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {ratingModal && (
        <RatingModal
          booking={ratingModal}
          onClose={() => setRatingModal(null)}
          onSubmit={submitRating}
        />
      )}
    </div>
  );
}
