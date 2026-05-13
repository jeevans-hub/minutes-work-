'use client';
import { useState, useEffect } from 'react';

const DEFAULT_CATEGORIES = [
  { name: 'Plumber', icon: '🔧', color: '#3B82F6', description: 'Pipe repairs, installations & more' },
  { name: 'Electrician', icon: '⚡', color: '#F59E0B', description: 'Wiring, fixtures & electrical work' },
  { name: 'Carpenter', icon: '🪚', color: '#F97316', description: 'Furniture, repairs & woodwork' },
  { name: 'Cleaner', icon: '🧹', color: '#10B981', description: 'Deep cleaning & housekeeping' },
  { name: 'Painter', icon: '🎨', color: '#EC4899', description: 'Interior & exterior painting' },
  { name: 'HVAC', icon: '❄️', color: '#6366F1', description: 'AC repair, installation & service' },
  { name: 'Mason', icon: '🧱', color: '#78716C', description: 'Brickwork, tiling & plastering' },
  { name: 'Gardener', icon: '🌿', color: '#84CC16', description: 'Lawn care & landscaping' },
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', icon: '🔧', description: '', color: '#4F46E5' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories);
      }
    } finally { setLoading(false); }
  };

  const seedCategories = async () => {
    setSaving(true);
    for (const cat of DEFAULT_CATEGORIES) {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cat),
      });
    }
    setSaving(false);
    fetchCategories();
  };

  const createCategory = async (e) => {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setShowForm(false);
    setForm({ name: '', icon: '🔧', description: '', color: '#4F46E5' });
    fetchCategories();
  };

  const toggleCategory = async (id, isActive) => {
    await fetch('/api/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    fetchCategories();
  };

  const deleteCategory = async (id) => {
    if (!confirm('Delete this category?')) return;
    await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
    fetchCategories();
  };

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Service <span className="gradient-text">Categories</span></h1>
            <p className="text-slate-400 mt-1">Manage worker service categories</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {categories.length === 0 && (
              <button onClick={seedCategories} disabled={saving} className="btn-secondary text-sm">
                {saving ? 'Seeding...' : '🌱 Seed Defaults'}
              </button>
            )}
            <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
              + Add Category
            </button>
          </div>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="glass-card p-6 mb-6 animate-fade-in">
            <h3 className="font-semibold mb-4">New Category</h3>
            <form onSubmit={createCategory} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Name *</label>
                <input type="text" className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g., Plumber" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Icon</label>
                <input type="text" className="input-field" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🔧" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <input type="text" className="input-field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description..." />
              </div>
              <div className="col-span-2 flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Create'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Categories grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
          </div>
        ) : categories.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <div className="text-5xl mb-4">🏷️</div>
            <h3 className="text-xl font-semibold mb-2">No categories yet</h3>
            <p className="text-slate-400 mb-4">Click "Seed Defaults" to add pre-built categories</p>
            <button onClick={seedCategories} disabled={saving} className="btn-primary">
              {saving ? 'Seeding...' : '🌱 Seed Default Categories'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {categories.map((cat) => (
              <div key={cat._id} className={`glass-card p-5 relative group transition-all ${!cat.isActive ? 'opacity-50' : 'hover:border-indigo-500/30'}`}>
                <div className="text-3xl mb-3">{cat.icon}</div>
                <h3 className="font-semibold text-white mb-1">{cat.name}</h3>
                <p className="text-xs text-slate-400 mb-4">{cat.description}</p>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleCategory(cat._id, cat.isActive)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      cat.isActive ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20' : 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                    }`}
                  >
                    {cat.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => deleteCategory(cat._id)}
                    className="text-xs text-rose-400 px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 transition-colors"
                  >
                    Delete
                  </button>
                </div>

                {!cat.isActive && (
                  <div className="absolute top-2 right-2 text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">Disabled</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
