'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

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

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 border-indigo-500/20 bg-slate-900/95 backdrop-blur-md shadow-xl">
        <p className="text-xs font-bold text-slate-300 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs font-semibold flex items-center gap-2" style={{ color: entry.color }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.name}: {entry.name === 'Revenue' ? `$${entry.value.toLocaleString()}` : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
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
  const monthlyTrend = data?.monthlyTrend || [];
  const statusBreakdown = data?.statusBreakdown || [];

  const userDistribution = [
    { name: 'Customers', value: stats.totalUsers || 0 },
    { name: 'Workers', value: stats.totalWorkers || 0 },
  ];

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
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Admin <span className="gradient-text">Dashboard</span></h1>
            <p className="text-slate-400 mt-1">Platform overview and graphical analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/bookings" className="btn-primary py-2 px-4 text-xs">
              Manage Bookings
            </Link>
          </div>
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

        {/* Graphical Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Monthly Trend Line Chart */}
          <div className="lg:col-span-2 glass-card p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-1">Revenue & Bookings Trend</h2>
              <p className="text-xs text-slate-400 mb-6">Monthly performance overview for the last 6 months</p>
            </div>
            {monthlyTrend.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-sm">No trend data available</div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="#34d399" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                    <Line yAxisId="left" type="monotone" dataKey="bookings" name="Bookings" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* User Distribution Pie Chart */}
          <div className="lg:col-span-1 glass-card p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-1">User Distribution</h2>
              <p className="text-xs text-slate-400 mb-6">Ratio of registered customers to workers</p>
            </div>
            <div className="h-72 w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={userDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {userDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#6366f1' : '#8b5cf6'} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-6 mt-2 w-full text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span>Customers: <strong>{stats.totalUsers || 0}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-violet-500" />
                  <span>Workers: <strong>{stats.totalWorkers || 0}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Booking Status Breakdown Bar Chart */}
          <div className="lg:col-span-2 glass-card p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-1">Booking Status Breakdown</h2>
              <p className="text-xs text-slate-400 mb-6">Distribution of jobs across various stages</p>
            </div>
            {statusBreakdown.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-sm">No status data available</div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="status" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Jobs Count" radius={[6, 6, 0, 0]}>
                      {statusBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Popular Services Analytics */}
          <div className="lg:col-span-1 glass-card p-6 flex flex-col justify-between">
            <div>
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
            </div>

            <div className="mt-8 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Growth Tip</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {popular[0]?.category || 'Service'} is currently your most requested category. Consider verifying more workers here.
              </p>
            </div>
          </div>
        </div>

        {/* Recent bookings table */}
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold">Recent Bookings</h2>
            <Link href="/admin/bookings" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">View all bookings →</Link>
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
                    <th>Category</th>
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
                        <td className="text-slate-300 text-xs">{b.workerId?.name || '-'}</td>
                        <td className="text-slate-400 text-xs">{b.workerId?.category || '-'}</td>
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
