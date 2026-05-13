'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const STATUS_CONFIG = {
  pending: { color: 'badge-pending', icon: '⏳', label: 'Pending' },
  accepted: { color: 'badge-accepted', icon: '✅', label: 'Accepted' },
  onTheWay: { color: 'bg-blue-500/20 text-blue-300', icon: '🚙', label: 'On The Way' },
  arrived: { color: 'bg-indigo-500/20 text-indigo-300', icon: '📍', label: 'Arrived' },
  inProgress: { color: 'badge-inProgress', icon: '🔄', label: 'In Progress' },
  completed: { color: 'badge-completed', icon: '🎉', label: 'Completed' },
  cancelled: { color: 'badge-cancelled', icon: '❌', label: 'Cancelled' },
  rejected: { color: 'badge-rejected', icon: '🚫', label: 'Rejected' },
};

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, active: 0, completed: 0 });

  useEffect(() => { fetchBookings(); }, []);

  // Background location tracking
  useEffect(() => {
    const activeTrackingJobs = bookings.filter(b => ['onTheWay', 'arrived'].includes(b.status));
    
    if (activeTrackingJobs.length === 0) return;

    const interval = setInterval(() => {
      navigator.geolocation?.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          activeTrackingJobs.forEach(job => {
            fetch(`/api/bookings/${job._id}/location`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ lat: latitude, lng: longitude }),
            }).catch(err => console.error(err));
          });
        },
        (err) => console.error('Geolocation error:', err),
        { enableHighAccuracy: true }
      );
    }, 10000); // Ping every 10s

    return () => clearInterval(interval);
  }, [bookings]);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const data = await res.json();
        const b = data.bookings;
        setBookings(b);
        setStats({
          total: b.length,
          pending: b.filter((x) => x.status === 'pending').length,
          active: b.filter((x) => ['accepted', 'onTheWay', 'arrived', 'inProgress'].includes(x.status)).length,
          completed: b.filter((x) => x.status === 'completed').length,
        });
      }
    } finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    const res = await fetch(`/api/bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) fetchBookings();
  };

  const pendingJobs = bookings.filter((b) => b.status === 'pending');
  const activeJobs = bookings.filter((b) => ['accepted', 'onTheWay', 'arrived', 'inProgress'].includes(b.status));
  const recentDone = bookings.filter((b) => b.status === 'completed').slice(0, 3);

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Worker Dashboard <span className="gradient-text">👷</span>
            </h1>
            <p className="text-slate-400 mt-1">Welcome back, {user?.name}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-amber-400">{user?.rating?.toFixed(1) || '0.0'} ★</div>
            <div className="text-xs text-slate-400">{user?.ratingCount || 0} reviews</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Total Jobs', value: stats.total, icon: '📋', color: 'from-indigo-500 to-indigo-700' },
            { label: 'New Requests', value: stats.pending, icon: '🔔', color: 'from-amber-500 to-orange-600' },
            { label: 'Active Jobs', value: stats.active, icon: '🔄', color: 'from-blue-500 to-cyan-600' },
            { label: 'Completed', value: stats.completed, icon: '✅', color: 'from-emerald-500 to-green-600' },
          ].map((s) => (
            <div key={s.label} className="glass-card p-6">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-sm text-slate-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            { href: '/worker/jobs', icon: '💼', title: 'All Jobs', desc: 'View and manage all job requests' },
            { href: '/worker/map', icon: '🗺️', title: 'Map View', desc: 'See job locations on map' },
            { href: '/worker/profile', icon: '👤', title: 'My Profile', desc: 'Update your skills & location' },
          ].map((link) => (
            <Link key={link.href} href={link.href} className="glass-card p-5 flex items-center gap-3 group hover:border-indigo-500/40 transition-all">
              <div className="text-2xl group-hover:animate-float">{link.icon}</div>
              <div>
                <div className="font-medium text-white text-sm">{link.title}</div>
                <div className="text-xs text-slate-500">{link.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pending Requests */}
        {pendingJobs.length > 0 && (
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-2 mb-5">
              <h2 className="text-lg font-semibold">New Job Requests</h2>
              <span className="badge bg-amber-500/20 text-amber-300">{pendingJobs.length} new</span>
            </div>
            <div className="space-y-4">
              {pendingJobs.map((b) => (
                <div key={b._id} className="flex items-center gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-bold">
                    {b.customerId?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm">{b.customerId?.name}</div>
                    <div className="text-xs text-slate-400">{b.category} • {b.customerId?.phone}</div>
                    {b.description && <div className="text-xs text-slate-500 mt-0.5 truncate">{b.description}</div>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus(b._id, 'accepted')} className="btn-success text-xs py-1.5 px-3">Accept</button>
                    <button onClick={() => updateStatus(b._id, 'rejected')} className="btn-danger text-xs py-1.5 px-3">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Jobs */}
        {activeJobs.length > 0 && (
          <div className="glass-card p-6 mb-6">
            <h2 className="text-lg font-semibold mb-5">Active Jobs</h2>
            <div className="space-y-4">
              {activeJobs.map((b) => {
                const cfg = STATUS_CONFIG[b.status];
                return (
                  <div key={b._id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/40">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center font-bold">
                      {b.customerId?.name?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white text-sm">{b.customerId?.name}</div>
                      <div className="text-xs text-slate-400">{b.category}</div>
                    </div>
                    <span className={`badge ${cfg.color}`}>{cfg.icon} {cfg.label}</span>
                    <div className="flex gap-2">
                      {b.status === 'accepted' && (
                        <button onClick={() => updateStatus(b._id, 'onTheWay')} className="btn-primary text-xs py-1.5 px-3">On the Way</button>
                      )}
                      {b.status === 'onTheWay' && (
                        <button onClick={() => updateStatus(b._id, 'arrived')} className="btn-primary text-xs py-1.5 px-3">Arrived</button>
                      )}
                      {b.status === 'arrived' && (
                        <button onClick={() => updateStatus(b._id, 'inProgress')} className="btn-primary text-xs py-1.5 px-3">Start Job</button>
                      )}
                      {b.status === 'inProgress' && (
                        <button onClick={() => updateStatus(b._id, 'completed')} className="btn-success text-xs py-1.5 px-3">Complete</button>
                      )}
                      <Link href={`/worker/map?bookingId=${b._id}`} className="btn-secondary text-xs py-1.5 px-3">📍 Navigate</Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && bookings.length === 0 && (
          <div className="glass-card p-16 text-center">
            <div className="text-5xl mb-4">👷</div>
            <h3 className="text-xl font-semibold mb-2">No jobs yet</h3>
            <p className="text-slate-400 mb-4">Complete your profile and set your location to receive nearby job requests</p>
            <Link href="/worker/profile" className="btn-primary text-sm">Update Profile</Link>
          </div>
        )}
      </div>
    </div>
  );
}
