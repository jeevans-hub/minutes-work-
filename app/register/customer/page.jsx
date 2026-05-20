'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function CustomerRegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register({
      ...form,
      role: 'customer',
    });

    setLoading(false);

    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.details ? `${result.error}: ${result.details}` : result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 pb-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md glass-card p-8 animate-fade-in relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
            <span className="text-2xl font-bold text-white">MW</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Customer Registration</h1>
          <p className="text-slate-400 text-sm mt-1">Join MintWork to book top-rated workers</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
            <input
              type="email"
              className="input-field"
              placeholder="john@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone Number</label>
            <input
              type="tel"
              className="input-field"
              placeholder="+1 234 567 890"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
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
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-rose-400 text-sm break-words">
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2 justify-center">
            {loading ? 'Creating Account...' : 'Create Customer Account'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-center text-slate-400 text-sm">
            Already have an account?{' '}
            <Link href="/login/customer" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Sign in
            </Link>
          </p>
          <p className="text-center text-slate-400 text-sm mt-2">
            Want to join as a worker?{' '}
            <Link href="/register/worker" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
