'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const CATEGORIES = ['Plumber', 'Electrician', 'Carpenter', 'Cleaner', 'Painter', 'HVAC', 'Mason', 'Gardener', 'Other'];

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState(searchParams.get('role') || 'customer');
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', category: '', experience: '', skills: [], referralCode: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) setForm(prev => ({ ...prev, referralCode: ref }));
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await register({ ...form, role, skills: role === 'worker' ? form.skills : [] });
    setLoading(false);
    if (result.success) {
      const r = result.user.role;
      if (r === 'worker') router.push('/worker/dashboard');
      else router.push('/dashboard');
    } else {
      setError(result.error);
    }
  };

  const toggleSkill = (skill) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill) ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill],
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 pb-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-60 h-60 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg glass-card p-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
            <span className="text-2xl font-bold">MW</span>
          </div>
          <h1 className="text-2xl font-bold">Join MintWork</h1>
          <p className="text-slate-400 text-sm mt-1">Create your account to get started</p>
        </div>

        {/* Role selector */}
        <div className="flex gap-3 p-1 bg-slate-800/50 rounded-xl mb-8">
          {['customer', 'worker'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all capitalize ${
                role === r ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              {r === 'customer' ? '👤 Customer' : '👷 Worker'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
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
              <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
              <input
                type="tel"
                className="input-field"
                placeholder="+91 9876543210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

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
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Referral Code (Optional)</label>
            <input
              type="text"
              className="input-field border-indigo-500/20 focus:border-indigo-500"
              placeholder="E.g. XYZ123"
              value={form.referralCode}
              onChange={(e) => setForm({ ...form, referralCode: e.target.value.toUpperCase() })}
            />
          </div>

          {/* Worker-specific fields */}
          {role === 'worker' && (
            <div className="space-y-4 pt-2 border-t border-slate-700/50">
              <p className="text-sm text-indigo-400 font-medium">Worker Details</p>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Primary Category</label>
                <select
                  className="input-field"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                >
                  <option value="">Select category...</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Years of Experience</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="e.g., 5"
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  min={0}
                  max={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Skills (select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        form.skills.includes(skill)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-700/50 text-slate-400 hover:text-white'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-rose-400 text-sm">
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 justify-center">
            {loading ? (
              <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account...</span>
            ) : `Create ${role === 'worker' ? 'Worker' : 'Customer'} Account`}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
