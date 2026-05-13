'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const STATUS_CONFIG = {
  pending: { color: 'badge-pending', label: 'Pending' },
  accepted: { color: 'badge-accepted', icon: '✅', label: 'Accepted' },
  inProgress: { color: 'badge-inProgress', icon: '🔄', label: 'In Progress' },
  completed: { color: 'badge-completed', icon: '🎉', label: 'Completed' },
  cancelled: { color: 'badge-cancelled', icon: '❌', label: 'Cancelled' },
  rejected: { color: 'badge-rejected', icon: '🚫', label: 'Rejected' },
};

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, active: 0 });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings);
        const b = data.bookings;
        setStats({
          total: b.length,
          pending: b.filter((x) => x.status === 'pending').length,
          completed: b.filter((x) => x.status === 'completed').length,
          active: b.filter((x) => ['accepted', 'inProgress'].includes(x.status)).length,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-slate-400 mt-1">Here's your booking overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Total Bookings', value: stats.total, icon: '📋', color: 'from-indigo-500 to-indigo-700' },
            { label: 'Pending', value: stats.pending, icon: '⏳', color: 'from-amber-500 to-orange-600' },
            { label: 'Active Jobs', value: stats.active, icon: '🔄', color: 'from-blue-500 to-cyan-600' },
            { label: 'Completed', value: stats.completed, icon: '✅', color: 'from-emerald-500 to-green-600' },
          ].map((s) => (
            <div key={s.label} className="glass-card p-6">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl mb-3`}>
                {s.icon}
              </div>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-sm text-slate-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-5 mb-8">
          <Link href="/workers" className="glass-card p-6 flex items-center gap-4 group hover:border-indigo-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 flex items-center justify-center text-2xl group-hover:animate-float">🔍</div>
            <div>
              <div className="font-semibold text-white">Find Workers</div>
              <div className="text-sm text-slate-400">Browse skilled workers near you</div>
            </div>
            <svg className="ml-auto w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link href="/profile" className="glass-card p-6 flex items-center gap-4 group hover:border-indigo-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-violet-600/20 flex items-center justify-center text-2xl group-hover:animate-float">👤</div>
            <div>
              <div className="font-semibold text-white">My Profile</div>
              <div className="text-sm text-slate-400">Update your details & location</div>
            </div>
            <svg className="ml-auto w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Recent Bookings */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Recent Bookings</h2>
            <Link href="/bookings" className="text-sm text-indigo-400 hover:text-indigo-300">View all →</Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-500">
              <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
              Loading bookings...
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-slate-400 mb-4">No bookings yet</p>
              <Link href="/workers" className="btn-primary text-sm">Book Your First Worker</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.slice(0, 5).map((b) => {
                const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                return (
                  <div key={b._id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-lg">
                      {b.workerId?.avatar || '👷'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm">{b.workerId?.name || 'Worker'}</div>
                      <div className="text-xs text-slate-400">{b.category} • {new Date(b.createdAt).toLocaleDateString()}</div>
                    </div>
                    <span className={`badge ${cfg.color}`}>{cfg.icon} {cfg.label}</span>
                    <Link href={`/bookings/${b._id}`} className="text-xs text-indigo-400 hover:text-indigo-300 ml-2">View →</Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
