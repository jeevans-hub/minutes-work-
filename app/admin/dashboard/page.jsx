'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const STATUS_CONFIG = {
  pending: { color: 'badge-pending', label: 'Pending' },
  accepted: { color: 'badge-accepted', label: 'Accepted' },
  onTheWay: { color: 'badge-accepted', label: 'On Way' },
  arrived: { color: 'badge-accepted', label: 'Arrived' },
  inProgress: { color: 'badge-inProgress', label: 'In Progress' },
  completed: { color: 'badge-completed', label: 'Completed' },
  cancelled: { color: 'badge-cancelled', label: 'Cancelled' },
  rejected: { color: 'badge-rejected', label: 'Rejected' },
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const recent = data?.recentBookings || [];
  const popular = data?.popularServices || [];

  const statCards = [
    { label: 'Revenue', value: `$${stats.totalRevenue?.toLocaleString() || 0}`, icon: '💰', color: 'from-emerald-500 to-teal-600', href: '/admin/bookings?status=completed' },
    { label: 'Customers', value: stats.totalUsers || 0, icon: '👤', color: 'from-indigo-500 to-indigo-700', href: '/admin/users' },
    { label: 'Workers', value: stats.totalWorkers || 0, icon: '👷', color: 'from-violet-500 to-purple-700', href: '/admin/workers' },
    { label: 'Total Bookings', value: stats.totalBookings || 0, icon: '📋', color: 'from-blue-500 to-cyan-600', href: '/admin/bookings' },
    { label: 'Disputes', value: stats.totalDisputes || 0, icon: '🚩', color: 'from-rose-500 to-red-700', href: '/admin/disputes' },
    { label: 'Pending Jobs', value: stats.pendingBookings || 0, icon: '⏳', color: 'from-amber-500 to-orange-600', href: '/admin/bookings?status=pending' },
  ];

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin <span className="gradient-text">Dashboard</span></h1>
          <p className="text-slate-400 mt-1">Platform overview and management</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((s) => (
            <Link key={s.label} href={s.href} className="glass-card p-5 group hover:border-indigo-500/30 hover:-translate-y-0.5 transition-all">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center text-xl mb-3 group-hover:shadow-lg transition-shadow`}>
                {s.icon}
              </div>
              <div className="text-xl font-bold text-white mb-0.5">{s.value}</div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{s.label}</div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Recent bookings */}
          <div className="lg:col-span-2 glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Recent Bookings</h2>
              <Link href="/admin/bookings" className="text-sm text-indigo-400 hover:text-indigo-300">View all →</Link>
            </div>

            {recent.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No bookings yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Worker</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.slice(0, 6).map((b) => {
                      const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                      return (
                        <tr key={b._id}>
                          <td className="font-medium text-xs">{b.customerId?.name || '-'}</td>
                          <td className="text-slate-400 text-xs">{b.workerId?.name || '-'}</td>
                          <td><span className={`badge ${cfg.color} text-[10px]`}>{cfg.label}</span></td>
                          <td className="text-slate-500 text-[10px]">{new Date(b.createdAt).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Popular Services Analytics */}
          <div className="lg:col-span-1 glass-card p-6">
            <h2 className="text-lg font-semibold mb-5">Popular Services</h2>
            <div className="space-y-4">
              {popular.map((service, idx) => (
                <div key={service.category} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">{service.category}</span>
                    <span className="text-indigo-400 font-bold">{service.count} jobs</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full"
                      style={{ width: `${(service.count / (popular[0]?.count || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {popular.length === 0 && <div className="text-center py-8 text-slate-500">No data available</div>}
            </div>

            <div className="mt-8 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Growth Tip</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {popular[0]?.category || 'Service'} is currently your most requested category. Consider verifying more workers here.
              </p>
            </div>
          </div>
        </div>

        {/* Quick nav */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { href: '/admin/users', icon: '👥', label: 'Customers' },
            { href: '/admin/workers', icon: '👷', label: 'Workers' },
            { href: '/admin/bookings', icon: '📋', label: 'Bookings' },
            { href: '/admin/disputes', icon: '🚩', label: 'Disputes' },
            { href: '/admin/categories', icon: '🏷️', label: 'Categories' },
          ].map((link) => (
            <Link key={link.href} href={link.href} className="glass-card p-4 flex items-center gap-3 group hover:border-indigo-500/30 transition-all">
              <span className="text-xl group-hover:animate-float">{link.icon}</span>
              <span className="text-xs font-bold text-slate-400 group-hover:text-white uppercase tracking-wider">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
