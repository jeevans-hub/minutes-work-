'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const CATEGORIES = ['Plumber', 'Electrician', 'Carpenter', 'Cleaner', 'Painter', 'HVAC', 'Mason', 'Gardener', 'Other'];

export default function WorkerRegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    category: '',
    experience: '',
    skills: [],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) {
      setError('Please select a primary category');
      return;
    }
    setError('');
    setLoading(true);

    const result = await register({
      ...form,
      role: 'worker',
      experience: Number(form.experience) || 0,
    });

    setLoading(false);

    if (result.success) {
      router.push('/worker/dashboard');
    } else {
      setError(result.details ? `${result.error}: ${result.details}` : result.error);
    }
  };

  const toggleSkill = (skill) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 pb-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-3/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-2xl glass-card p-8 animate-fade-in relative z-10 border-emerald-500/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25">
            <span className="text-2xl font-bold text-white">MW</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Worker Registration</h1>
          <p className="text-slate-400 text-sm mt-1">Start earning by providing your skills on MintWork</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                className="input-field focus:border-emerald-500/50"
                placeholder="John Worker"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                className="input-field focus:border-emerald-500/50"
                placeholder="worker@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone Number</label>
              <input
                type="tel"
                className="input-field focus:border-emerald-500/50"
                placeholder="+1 234 567 890"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Years of Experience</label>
              <input
                type="number"
                className="input-field focus:border-emerald-500/50"
                placeholder="e.g. 5"
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Primary Category</label>
            <select
              className="input-field focus:border-emerald-500/50"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Skills & Expertise</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.filter(c => c !== 'Other').map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                    form.skills.includes(skill)
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/20'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-emerald-500/30'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <input
              type="password"
              className="input-field focus:border-emerald-500/50"
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

          <button type="submit" disabled={loading} className="btn-primary bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-none w-full py-4 justify-center shadow-lg shadow-emerald-900/20">
            {loading ? 'Registering...' : 'Create Worker Account'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-center text-slate-400 text-sm">
            Already have a worker account?{' '}
            <Link href="/login/worker" className="text-emerald-400 hover:text-emerald-300 font-medium">
              Sign in
            </Link>
          </p>
          <p className="text-center text-slate-400 text-sm mt-2">
            Register as a customer instead?{' '}
            <Link href="/register/customer" className="text-emerald-400 hover:text-emerald-300 font-medium">
              Click here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
