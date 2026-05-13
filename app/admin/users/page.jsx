'use client';
import { useState, useEffect } from 'react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async (q = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?role=customer&search=${q}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
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
    fetchUsers(search);
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete this user permanently?')) return;
    setActionLoading(id);
    await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
    setActionLoading(null);
    fetchUsers(search);
  };

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Manage <span className="gradient-text">Customers</span></h1>
          <p className="text-slate-400 mt-1">View, block, and manage customer accounts</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            className="input-field max-w-md"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers(search)}
          />
          <button onClick={() => fetchUsers(search)} className="btn-primary px-5">Search</button>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
            <h2 className="font-semibold">{users.length} Customers</h2>
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
                    <th>User</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold">
                            {u.name?.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{u.name}</div>
                            <div className="text-xs text-slate-500">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-slate-400 text-sm">{u.phone || '-'}</td>
                      <td>
                        {u.isBlocked ? (
                          <span className="badge badge-rejected">🚫 Blocked</span>
                        ) : (
                          <span className="badge badge-completed">✅ Active</span>
                        )}
                      </td>
                      <td className="text-slate-500 text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="flex gap-2">
                          {actionLoading === u._id ? (
                            <span className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                          ) : (
                            <>
                              {u.isBlocked ? (
                                <button onClick={() => doAction(u._id, 'unblock')} className="text-xs text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors">
                                  Unblock
                                </button>
                              ) : (
                                <button onClick={() => doAction(u._id, 'block')} className="text-xs text-amber-400 hover:text-amber-300 px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 transition-colors">
                                  Block
                                </button>
                              )}
                              <button onClick={() => deleteUser(u._id)} className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 transition-colors">
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="text-center py-12 text-slate-500">No customers found</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
