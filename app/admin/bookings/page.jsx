'use client';
import { useState, useEffect } from 'react';

const STATUS_CONFIG = {
  pending: { color: 'badge-pending', label: 'Pending' },
  accepted: { color: 'badge-accepted', label: 'Accepted' },
  inProgress: { color: 'badge-inProgress', label: 'In Progress' },
  completed: { color: 'badge-completed', label: 'Completed' },
  cancelled: { color: 'badge-cancelled', label: 'Cancelled' },
  rejected: { color: 'badge-rejected', label: 'Rejected' },
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => { fetchBookings(); }, [filter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings${filter ? `?status=${filter}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings);
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">All <span className="gradient-text">Bookings</span></h1>
          <p className="text-slate-400 mt-1">Monitor all platform bookings</p>
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          {['', 'pending', 'accepted', 'inProgress', 'completed', 'cancelled', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                filter === s ? 'bg-indigo-600 text-white' : 'bg-slate-800/50 text-slate-400 hover:text-white'
              }`}
            >
              {s === '' ? 'All' : s === 'inProgress' ? 'In Progress' : s}
            </button>
          ))}
        </div>

        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/50">
            <span className="font-semibold">{bookings.length} bookings</span>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Worker</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Rating</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => {
                    const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                    return (
                      <tr key={b._id}>
                        <td>
                          <div className="font-medium text-sm">{b.customerId?.name || '-'}</div>
                          <div className="text-xs text-slate-500">{b.customerId?.phone}</div>
                        </td>
                        <td>
                          <div className="font-medium text-sm">{b.workerId?.name || '-'}</div>
                          <div className="text-xs text-slate-500">{b.workerId?.category}</div>
                        </td>
                        <td className="text-slate-400">{b.category}</td>
                        <td><span className={`badge ${cfg.color}`}>{cfg.label}</span></td>
                        <td><span className="capitalize text-slate-400 text-sm">{b.paymentType}</span></td>
                        <td>
                          {b.rating ? (
                            <span className="text-amber-400">{'★'.repeat(b.rating)}</span>
                          ) : <span className="text-slate-600">-</span>}
                        </td>
                        <td className="text-slate-500 text-sm">{new Date(b.createdAt).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {bookings.length === 0 && (
                <div className="text-center py-12 text-slate-500">No bookings found</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
