'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const CATEGORIES = ['Plumber', 'Electrician', 'Carpenter', 'Cleaner', 'Painter', 'HVAC', 'Mason', 'Gardener', 'Other'];

function RegisterContent() {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [role, setRole] = useState(searchParams.get('role') || 'customer');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    category: '',
    experience: '',
    skills: [],
    referralCode: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setForm((prev) => ({ ...prev, referralCode: ref }));
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register({
      ...form,
      role,
      skills: role === 'worker' ? form.skills : [],
    });

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
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 pb-12">
      <div className="w-full max-w-lg glass-card p-8 animate-fade-in">
        <h1 className="text-2xl font-bold mb-6 text-center">Join MintWork</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            className="input-field"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <input
            type="email"
            className="input-field"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <input
            type="password"
            className="input-field"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          {role === 'worker' && (
            <div>
              <select
                className="input-field"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Select Category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <div className="flex flex-wrap gap-2 mt-4">
                {CATEGORIES.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1 rounded ${form.skills.includes(skill)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-700 text-gray-300'
                      }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-red-500">{error}</p>}

          <button type="submit" className="btn-primary w-full">
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
