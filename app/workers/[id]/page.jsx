'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`text-xl ${i < Math.round(rating) ? 'text-amber-400' : 'text-slate-600'}`}>★</span>
      ))}
      <span className="text-sm text-slate-400 ml-2 font-medium">({rating?.toFixed(1) || '0.0'})</span>
    </div>
  );
}

export default function WorkerProfilePage() {
  const { id } = useParams();
  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/workers/${id}`).then(res => res.json()),
      fetch(`/api/workers/${id}/reviews`).then(res => res.json())
    ])
    .then(([workerData, reviewsData]) => {
      if (workerData.worker) setWorker(workerData.worker);
      if (reviewsData.reviews) setReviews(reviewsData.reviews);
    })
    .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen pt-24 text-center">Loading...</div>;
  if (!worker) return <div className="min-h-screen pt-24 text-center">Worker not found.</div>;

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Profile Header */}
        <div className="glass-card p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-5xl font-bold shadow-lg shadow-indigo-500/20 shrink-0">
              {worker.avatar || worker.name?.charAt(0)?.toUpperCase()}
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                <h1 className="text-3xl font-bold">{worker.name}</h1>
                <Link href={`/book/${worker._id}`} className="btn-primary px-8">
                  Book Now
                </Link>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="badge bg-indigo-500/20 text-indigo-300">{worker.category}</span>
                {worker.isVerified && <span className="text-sm text-emerald-400 font-medium flex items-center gap-1">✓ Verified Pro</span>}
                <span className="text-sm text-slate-400">📍 {worker.address || 'Remote'}</span>
              </div>

              <div className="flex items-center gap-6">
                <div>
                  <StarRating rating={worker.rating} />
                  <p className="text-xs text-slate-500 mt-1">{worker.ratingCount || 0} Total Reviews</p>
                </div>
                <div className="h-10 w-px bg-slate-700"></div>
                <div>
                  <div className="text-xl font-bold text-white">{worker.experience || 0}</div>
                  <div className="text-xs text-slate-500">Years Exp.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bio & Skills */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 glass-card p-8">
            <h3 className="text-lg font-bold mb-4">About Me</h3>
            <p className="text-slate-300 leading-relaxed">
              {worker.bio || "This worker hasn't added a bio yet."}
            </p>
          </div>
          
          <div className="glass-card p-8">
            <h3 className="text-lg font-bold mb-4">Skills</h3>
            {worker.skills?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {worker.skills.map(skill => (
                  <span key={skill} className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-sm border border-slate-700">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No specific skills listed.</p>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="glass-card p-8">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
            Customer <span className="gradient-text">Reviews</span>
            <span className="text-sm font-normal text-slate-500 bg-slate-800 px-3 py-1 rounded-full">
              {reviews.length} reviews
            </span>
          </h3>

          {reviews.length === 0 ? (
            <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-700/50 rounded-2xl">
              <span className="text-4xl block mb-3">⭐</span>
              No reviews yet. Book this worker to leave the first review!
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((rev) => (
                <div key={rev._id} className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold">
                        {rev.customerId?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">{rev.customerId?.name || 'Anonymous User'}</div>
                        <div className="text-xs text-slate-500">{new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`text-sm ${i < rev.rating ? 'text-amber-400' : 'text-slate-700'}`}>★</span>
                      ))}
                    </div>
                  </div>
                  {rev.review ? (
                    <p className="text-slate-300 text-sm leading-relaxed">&ldquo;{rev.review}&rdquo;</p>
                  ) : (
                    <p className="text-slate-500 text-sm italic">User left a rating without a written review.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
