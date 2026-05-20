'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginPage() {
  const { login, logout } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(form.email, form.password);
    
    if (result.success) {
      const { role } = result.user;
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        // If not admin, log them out immediately and show error
        await fetch('/api/auth/login', { method: 'DELETE' });
        setError('Access denied. Admin credentials required.');
        setLoading(false);
      }
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-rose-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-60 h-60 bg-orange-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md glass-card p-8 animate-fade-in border-rose-500/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-500/25">
            <span className="text-2xl font-bold text-white">🛡️</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-slate-400 text-sm mt-1">Authorized personnel only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Admin Email</label>
            <input
              type="email"
              className="input-field focus:border-rose-500"
              placeholder="admin@mintwork.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <Link href="/forgot-password" className="text-xs text-rose-400 hover:text-rose-300 font-medium">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              className="input-field focus:border-rose-500"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-rose-400 text-sm animate-shake">
              ⚠️ {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Authenticating...
              </>
            ) : 'Access Dashboard'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center space-y-2">
          <p className="text-slate-400 text-sm">
            Are you a Customer?{' '}
            <Link href="/login/customer" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Customer Login →
            </Link>
          </p>
          <p className="text-slate-400 text-sm">
            Are you a Worker?{' '}
            <Link href="/login/worker" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Worker Login →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
