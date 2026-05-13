'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ReferralCard from '@/components/ReferralCard';

const CATEGORIES = ['Plumber', 'Electrician', 'Carpenter', 'Cleaner', 'Painter', 'HVAC', 'Mason', 'Gardener', 'Other'];

export default function ProfilePage() {
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

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        setSuccess('Profile updated successfully!');
        fetchUser();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My <span className="gradient-text">Profile</span></h1>
          <p className="text-slate-400 mt-1">Manage your account information</p>
        </div>

        {/* Avatar */}
        <div className="glass-card p-6 mb-6 flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-3xl font-bold shadow-lg shadow-indigo-500/20">
            {profile?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile?.name}</h2>
            <p className="text-slate-400 text-sm">{profile?.email}</p>
            <span className="badge bg-indigo-500/20 text-indigo-300 mt-1 capitalize">{profile?.role}</span>
          </div>
          {profile?.role === 'worker' && (
            <div className="ml-auto text-right">
              <div className="text-2xl font-bold text-amber-400">{profile?.rating?.toFixed(1) || '0.0'}</div>
              <div className="text-xs text-slate-400">{profile?.ratingCount || 0} reviews</div>
            </div>
          )}
        </div>

        {/* Referral Section */}
        {profile && <div className="mb-6"><ReferralCard user={profile} /></div>}

        {/* Form */}
        <form onSubmit={handleSave} className="glass-card p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
              <input
                type="text"
                className="input-field"
                value={profile?.name || ''}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
              <input
                type="tel"
                className="input-field"
                value={profile?.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+91 9876543210"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Address</label>
            <input
              type="text"
              className="input-field"
              value={profile?.address || ''}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              placeholder="Your full address"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Location Coordinates</label>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <input
                type="number"
                className="input-field"
                placeholder="Latitude"
                step="any"
                value={profile?.location?.lat || ''}
                onChange={(e) => setProfile({ ...profile, location: { ...profile.location, lat: parseFloat(e.target.value) } })}
              />
              <input
                type="number"
                className="input-field"
                placeholder="Longitude"
                step="any"
                value={profile?.location?.lng || ''}
                onChange={(e) => setProfile({ ...profile, location: { ...profile.location, lng: parseFloat(e.target.value) } })}
              />
              <button
                type="button"
                onClick={detectLocation}
                disabled={locating}
                className="btn-secondary whitespace-nowrap flex items-center gap-2"
              >
                {locating ? <span className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" /> : '📍'}
                Detect
              </button>
            </div>
            {profile?.location?.lat && (
              <p className="text-xs text-emerald-400 mt-1">📍 Location set: {profile.location.lat?.toFixed(4)}, {profile.location.lng?.toFixed(4)}</p>
            )}
          </div>

          {/* Worker-specific */}
          {profile?.role === 'worker' && (
            <div className="space-y-4 pt-4 border-t border-slate-700/50">
              <p className="text-sm text-indigo-400 font-medium">Worker Settings</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                  <select
                    className="input-field"
                    value={profile?.category || ''}
                    onChange={(e) => setProfile({ ...profile, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Experience (years)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={profile?.experience || 0}
                    onChange={(e) => setProfile({ ...profile, experience: parseInt(e.target.value) })}
                    min={0}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
                <textarea
                  className="input-field resize-none min-h-[80px]"
                  placeholder="Tell customers about yourself..."
                  value={profile?.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="available"
                  checked={profile?.isAvailable || false}
                  onChange={(e) => setProfile({ ...profile, isAvailable: e.target.checked })}
                  className="w-4 h-4 accent-indigo-500"
                />
                <label htmlFor="available" className="text-sm text-slate-300">Available for new jobs</label>
              </div>
            </div>
          )}

          {error && <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-rose-400 text-sm">⚠️ {error}</div>}
          {success && <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-emerald-400 text-sm">✅ {success}</div>}

          <button type="submit" disabled={saving} className="btn-primary w-full py-3 justify-center">
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...
              </span>
            ) : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
