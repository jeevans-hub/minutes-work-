'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      const { role } = result.user;
      if (role === 'admin') router.push('/admin/dashboard');
      else if (role === 'worker') router.push('/worker/dashboard');
      else router.push('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-60 h-60 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md glass-card p-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
            <span className="text-2xl font-bold">MW</span>
          </div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your MintWork account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
            <input
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <Link href="/forgot-password" size="sm" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-rose-400 text-sm">
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 justify-center">
            {loading ? (
              <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</span>
            ) : 'Sign In'}
          </button>
        </form>

        {/* Demo accounts */}
        <div className="mt-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <p className="text-xs text-slate-400 mb-3 font-medium">🧪 Demo Accounts (create via Register)</p>
          <div className="space-y-1 text-xs text-slate-500">
            <p>Admin: admin@mintwork.com / admin123</p>
          </div>
        </div>

        <p className="text-center text-slate-400 text-sm mt-6">
          Don't have an account?{' '}
          <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Create one →
          </Link>
        </p>
      </div>
    </div>
  );
}
