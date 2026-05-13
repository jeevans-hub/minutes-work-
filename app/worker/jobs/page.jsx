'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const STATUS_CONFIG = {
  pending: { color: 'badge-pending', icon: '⏳', label: 'Pending' },
  accepted: { color: 'badge-accepted', icon: '✅', label: 'Accepted' },
  inProgress: { color: 'badge-inProgress', icon: '🔄', label: 'In Progress' },
  completed: { color: 'badge-completed', icon: '🎉', label: 'Completed' },
  cancelled: { color: 'badge-cancelled', icon: '❌', label: 'Cancelled' },
  rejected: { color: 'badge-rejected', icon: '🚫', label: 'Rejected' },
};

export default function WorkerJobsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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

  const updateStatus = async (id, status) => {
    await fetch(`/api/bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchBookings();
  };

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Job <span className="gradient-text">Requests</span></h1>
          <p className="text-slate-400 mt-1">Manage all your job requests</p>
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          {['all', 'pending', 'accepted', 'inProgress', 'completed', 'rejected', 'cancelled'].map((s) => (
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
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <div className="text-4xl mb-3">💼</div>
            <p className="text-slate-400">No jobs found</p>
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
                        {b.customerId?.name?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{b.customerId?.name}</h3>
                        <p className="text-sm text-slate-400">{b.customerId?.phone} • {b.category}</p>
                      </div>
                    </div>
                    <span className={`badge ${cfg.color}`}>{cfg.icon} {cfg.label}</span>
                  </div>

                  {b.description && (
                    <div className="bg-slate-800/40 rounded-xl p-3 mb-4 text-sm text-slate-300">
                      {b.description}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 mb-4">
                    <div>📅 {new Date(b.createdAt).toLocaleString()}</div>
                    <div>💳 {b.paymentType}</div>
                    {b.location?.address && <div className="col-span-2">📍 {b.location.address}</div>}
                    {b.scheduledAt && <div className="col-span-2">🕐 Scheduled: {new Date(b.scheduledAt).toLocaleString()}</div>}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {b.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(b._id, 'accepted')} className="btn-success text-sm py-1.5 px-4">✅ Accept</button>
                        <button onClick={() => updateStatus(b._id, 'rejected')} className="btn-danger text-sm py-1.5 px-4">🚫 Reject</button>
                      </>
                    )}
                    {b.status === 'accepted' && (
                      <button onClick={() => updateStatus(b._id, 'inProgress')} className="btn-primary text-sm py-1.5 px-4">▶️ Start Job</button>
                    )}
                    {b.status === 'inProgress' && (
                      <button onClick={() => updateStatus(b._id, 'completed')} className="btn-success text-sm py-1.5 px-4">🏁 Mark Complete</button>
                    )}
                    {['accepted', 'inProgress'].includes(b.status) && b.location?.lat && (
                      <Link href={`/worker/map?bookingId=${b._id}`} className="btn-secondary text-sm py-1.5 px-4">
                        📍 Navigate
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
