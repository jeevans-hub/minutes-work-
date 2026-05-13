'use client';
import { useState, useEffect } from 'react';

export default function AdminWorkersPage() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => { fetchWorkers(); }, []);

  const fetchWorkers = async (q = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?role=worker&search=${q}`);
      if (res.ok) {
        const data = await res.json();
        setWorkers(data.users);
      }
    } finally { setLoading(false); }
  };

  const doAction = async (id, action) => {
    setActionLoading(id);
    await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    });
    setActionLoading(null);
    fetchWorkers(search);
  };

  const deleteWorker = async (id) => {
    if (!confirm('Delete this worker permanently?')) return;
    setActionLoading(id);
    await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
    setActionLoading(null);
    fetchWorkers(search);
  };

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Manage <span className="gradient-text">Workers</span></h1>
          <p className="text-slate-400 mt-1">View, verify, block, and manage worker accounts</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            className="input-field max-w-md"
            placeholder="Search workers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchWorkers(search)}
          />
          <button onClick={() => fetchWorkers(search)} className="btn-primary px-5">Search</button>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/50">
            <h2 className="font-semibold">{workers.length} Workers</h2>
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
                    <th>Worker</th>
                    <th>Category</th>
                    <th>Rating</th>
                    <th>Experience</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map((w) => (
                    <tr key={w._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                            {w.name?.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{w.name}</div>
                            <div className="text-xs text-slate-500">{w.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-slate-400">{w.category || '-'}</td>
                      <td>
                        <span className="text-amber-400">★</span>
                        <span className="text-sm ml-1">{w.rating?.toFixed(1) || '0.0'}</span>
                        <span className="text-xs text-slate-500 ml-1">({w.ratingCount || 0})</span>
                      </td>
                      <td className="text-slate-400">{w.experience || 0} yrs</td>
                      <td>
                        <div className="flex flex-col gap-1">
                          {w.isBlocked ? (
                            <span className="badge badge-rejected text-xs">Blocked</span>
                          ) : (
                            <span className="badge badge-completed text-xs">Active</span>
                          )}
                          {w.isVerified && <span className="badge bg-emerald-500/20 text-emerald-300 text-xs">✓ Verified</span>}
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-1 flex-wrap">
                          {actionLoading === w._id ? (
                            <span className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                          ) : (
                            <>
                              {!w.isVerified && (
                                <button onClick={() => doAction(w._id, 'verify')} className="text-xs text-indigo-400 px-2 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors">Verify</button>
                              )}
                              {w.isBlocked ? (
                                <button onClick={() => doAction(w._id, 'unblock')} className="text-xs text-emerald-400 px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors">Unblock</button>
                              ) : (
                                <button onClick={() => doAction(w._id, 'block')} className="text-xs text-amber-400 px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 transition-colors">Block</button>
                              )}
                              <button onClick={() => deleteWorker(w._id)} className="text-xs text-rose-400 px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 transition-colors">Delete</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {workers.length === 0 && (
                <div className="text-center py-12 text-slate-500">No workers found</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
