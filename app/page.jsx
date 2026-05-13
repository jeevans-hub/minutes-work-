'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  { name: 'Plumber', icon: '🔧', color: 'from-blue-500 to-cyan-500', desc: 'Pipe repairs, installations & more' },
  { name: 'Electrician', icon: '⚡', color: 'from-yellow-500 to-amber-500', desc: 'Wiring, fixtures & electrical work' },
  { name: 'Carpenter', icon: '🪚', color: 'from-orange-500 to-red-500', desc: 'Furniture, repairs & woodwork' },
  { name: 'Cleaner', icon: '🧹', color: 'from-green-500 to-emerald-500', desc: 'Deep cleaning & housekeeping' },
  { name: 'Painter', icon: '🎨', color: 'from-pink-500 to-rose-500', desc: 'Interior & exterior painting' },
  { name: 'HVAC', icon: '❄️', color: 'from-indigo-500 to-blue-500', desc: 'AC repair, installation & service' },
  { name: 'Mason', icon: '🧱', color: 'from-stone-500 to-neutral-500', desc: 'Brickwork, tiling & plastering' },
  { name: 'Gardener', icon: '🌿', color: 'from-lime-500 to-green-500', desc: 'Lawn care & landscaping' },
];

const STATS = [
  { label: 'Skilled Workers', value: '2,500+', icon: '👷' },
  { label: 'Happy Customers', value: '12,000+', icon: '😊' },
  { label: 'Jobs Completed', value: '45,000+', icon: '✅' },
  { label: 'Cities Covered', value: '50+', icon: '🏙️' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Homeowner', text: 'Found an excellent plumber within minutes. Professional service and fair pricing!', rating: 5 },
  { name: 'Rahul Mehta', role: 'Office Manager', text: 'Our office AC was fixed the same day. MintWork is my go-to for all maintenance needs.', rating: 5 },
  { name: 'Anita Patel', role: 'Apartment Resident', text: 'The electrician was on time, skilled, and very transparent about the work needed.', rating: 4 },
];

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    fetch('/api/recommendations')
      .then((res) => res.json())
      .then((data) => {
        if (data.recommendations) setRecommendations(data.recommendations);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleCategoryClick = (cat) => {
    router.push(`/workers?category=${cat}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-4 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-10 w-60 h-60 bg-amber-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 animate-fade-in">
            Book Skilled Workers<br />
            <span className="gradient-text">Near You Instantly</span>
          </h1>

          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto animate-fade-in">
            Find verified plumbers, electricians, carpenters & more — sorted by proximity and ratings. Fast, reliable, and at your service.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            {user ? (
              <Link href={user.role === 'worker' ? '/worker/dashboard' : user.role === 'admin' ? '/admin/dashboard' : '/workers'} className="btn-primary text-base px-8 py-4">
                {user.role === 'worker' ? 'View Jobs' : user.role === 'admin' ? 'Admin Panel' : '🔍 Find Workers'}
              </Link>
            ) : (
              <>
                <Link href="/register" className="btn-primary text-base px-8 py-4">
                  🚀 Get Started Free
                </Link>
                <Link href="/workers" className="btn-secondary text-base px-8 py-4">
                  Browse Workers
                </Link>
              </>
            )}
          </div>

          {/* Search bar */}
          <div className="mt-12 max-w-2xl mx-auto animate-fade-in">
            <div className="flex flex-col sm:flex-row gap-3 glass-card p-2">
              <input
                type="text"
                placeholder="What service do you need?"
                className="flex-1 bg-transparent border-none outline-none text-white px-4 py-2 placeholder-slate-500"
                onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/workers?search=${e.target.value}`); }}
              />
              <button
                className="btn-primary px-6 py-2 text-sm"
                onClick={(e) => {
                  const input = e.target.closest('.glass-card').querySelector('input');
                  router.push(`/workers?search=${input.value}`);
                }}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="glass-card p-6 text-center group hover:border-indigo-500/30 transition-all">
                <div className="text-4xl mb-3 group-hover:animate-float">{stat.icon}</div>
                <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Smart Recommendations */}
      {recommendations.length > 0 && (
        <section className="py-12 px-4 bg-indigo-900/10 border-y border-indigo-500/10">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <span className="text-3xl animate-pulse-glow">✨</span>
              <h2 className="text-2xl font-bold">Smart <span className="gradient-text">Recommendations</span></h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {recommendations.map((rec) => (
                <div key={rec.category} onClick={() => handleCategoryClick(rec.category)} className="glass-card p-6 cursor-pointer group hover:border-indigo-500/40 hover:-translate-y-1 transition-all">
                  <div className="flex items-start gap-4 mb-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${rec.color || 'from-indigo-500 to-violet-500'} flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform`}>
                      {rec.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{rec.category}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{rec.reason}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our <span className="gradient-text">Services</span></h2>
            <p className="text-slate-400">Professional workers across all home service categories</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                className="glass-card p-6 text-left group hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                  {cat.icon}
                </div>
                <h3 className="font-semibold text-white mb-1">{cat.name}</h3>
                <p className="text-xs text-slate-400">{cat.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">How It <span className="gradient-text">Works</span></h2>
            <p className="text-slate-400">Book a skilled worker in 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-indigo-500/50 to-violet-500/50" />

            {[
              { step: '01', icon: '📍', title: 'Find Workers', desc: 'Browse skilled workers near you filtered by category and sorted by distance & rating.' },
              { step: '02', icon: '📋', title: 'Book a Service', desc: 'Select a worker, describe your problem, choose payment method, and submit your booking.' },
              { step: '03', icon: '✅', title: 'Get it Done', desc: 'Worker accepts, arrives at your location, completes the job. Rate & review when done.' },
            ].map((s) => (
              <div key={s.step} className="glass-card p-8 text-center relative group hover:-translate-y-1 transition-all">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-3xl mx-auto mb-4 group-hover:animate-pulse-glow">
                  {s.icon}
                </div>
                <div className="text-xs text-indigo-400 font-bold mb-2">STEP {s.step}</div>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">What Customers <span className="gradient-text">Say</span></h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="glass-card p-6 group hover:border-indigo-500/30 transition-all">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < t.rating ? 'text-amber-400' : 'text-slate-600'}>★</span>
                  ))}
                </div>
                <p className="text-slate-300 text-sm mb-4 italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-sm font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-violet-600/10" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-slate-400 mb-8">Join thousands of satisfied customers and skilled workers on MintWork.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register?role=customer" className="btn-primary text-base px-8 py-4">Book a Worker</Link>
                <Link href="/register?role=worker" className="btn-secondary text-base px-8 py-4">Join as Worker</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-4 text-center text-slate-500 text-sm">
        <p>© 2024 MintWork. All rights reserved. | Built with ❤️ for skilled workers everywhere.</p>
      </footer>
    </div>
  );
}
