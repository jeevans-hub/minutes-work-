'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

const CATEGORIES = ['Plumber', 'Electrician', 'Carpenter', 'Cleaner', 'Painter', 'HVAC', 'Mason', 'Gardener', 'Other'];

export default function WorkerProfilePage() {
  const { user, fetchUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/users/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
      }
    } finally { setLoading(false); }
  };

  const detectLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setProfile((prev) => ({ ...prev, location: { lat: pos.coords.latitude, lng: pos.coords.longitude } }));
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  const toggleSkill = (skill) => {
    const skills = profile.skills || [];
    setProfile({ ...profile, skills: skills.includes(skill) ? skills.filter((s) => s !== skill) : [...skills, skill] });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        setSuccess('Profile updated!');
        fetchUser();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } finally { setSaving(false); }
  };

  if (loading) {
    return <div className="min-h-screen pt-20 flex items-center justify-center"><div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Worker <span className="gradient-text">Profile</span></h1>
          <p className="text-slate-400 mt-1">Set up your skills and location to get jobs</p>
        </div>

        {/* Profile card */}
        <div className="glass-card p-6 mb-6 flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-3xl font-bold shadow-lg">
            {profile?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile?.name}</h2>
            <p className="text-slate-400 text-sm">{profile?.email}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="badge bg-indigo-500/20 text-indigo-300">{profile?.category || 'No category'}</span>
              {profile?.isVerified && <span className="text-xs text-emerald-400">✓ Verified</span>}
            </div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-2xl font-bold text-amber-400">{profile?.rating?.toFixed(1) || '0.0'} ★</div>
            <div className="text-xs text-slate-400">{profile?.ratingCount || 0} reviews</div>
          </div>
        </div>

        <form onSubmit={handleSave} className="glass-card p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
              <input type="text" className="input-field" value={profile?.name || ''} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
              <input type="tel" className="input-field" value={profile?.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+91..." />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Primary Category</label>
              <select className="input-field" value={profile?.category || ''} onChange={(e) => setProfile({ ...profile, category: e.target.value })}>
                <option value="">Select...</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Experience (years)</label>
              <input type="number" className="input-field" value={profile?.experience || 0} onChange={(e) => setProfile({ ...profile, experience: parseInt(e.target.value) })} min={0} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Skills</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    (profile?.skills || []).includes(skill) ? 'bg-indigo-600 text-white' : 'bg-slate-700/50 text-slate-400 hover:text-white'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
            <textarea className="input-field resize-none min-h-[80px]" placeholder="Describe your expertise..." value={profile?.bio || ''} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Your Location</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input type="number" className="input-field" placeholder="Latitude" step="any" value={profile?.location?.lat || ''} onChange={(e) => setProfile({ ...profile, location: { ...profile.location, lat: parseFloat(e.target.value) } })} />
              <input type="number" className="input-field" placeholder="Longitude" step="any" value={profile?.location?.lng || ''} onChange={(e) => setProfile({ ...profile, location: { ...profile.location, lng: parseFloat(e.target.value) } })} />
              <button type="button" onClick={detectLocation} disabled={locating} className="btn-secondary whitespace-nowrap flex items-center gap-2">
                {locating ? <span className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" /> : '📍'}
                Detect
              </button>
            </div>
            {profile?.location?.lat && (
              <p className="text-xs text-emerald-400 mt-1">📍 {profile.location.lat?.toFixed(4)}, {profile.location.lng?.toFixed(4)}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="available" checked={profile?.isAvailable ?? true} onChange={(e) => setProfile({ ...profile, isAvailable: e.target.checked })} className="w-4 h-4 accent-indigo-500" />
            <label htmlFor="available" className="text-sm text-slate-300">Available for new jobs</label>
          </div>

          {error && <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-rose-400 text-sm">⚠️ {error}</div>}
          {success && <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-emerald-400 text-sm">✅ {success}</div>}

          <button type="submit" disabled={saving} className="btn-primary w-full py-3 justify-center">
            {saving ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</span> : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
