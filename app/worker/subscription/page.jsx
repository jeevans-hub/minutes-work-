'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const PLANS = [
  {
    id: 'free',
    name: 'Standard',
    price: 0,
    features: ['Standard Visibility', '20% Platform Fee', 'Basic Profile'],
    color: 'slate',
  },
  {
    id: 'pro',
    name: 'Pro Partner',
    price: 499,
    features: ['High Visibility', '15% Platform Fee', 'Verified Badge (Fast-track)', 'Analytics Dashboard'],
    color: 'indigo',
    popular: true,
  },
  {
    id: 'elite',
    name: 'Elite Pro',
    price: 999,
    features: ['Top Ranking', '10% Platform Fee', 'Featured Profile Listing', 'Priority Support', 'Early Access Jobs'],
    color: 'amber',
  },
];

export default function SubscriptionPage() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(null);

  const handleUpgrade = async (planId) => {
    if (planId === 'free') return;
    setLoading(planId);
    try {
      const res = await fetch('/api/worker/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Successfully upgraded to ${planId.toUpperCase()}!`);
        setUser(data.user);
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert('Payment failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Level Up Your <span className="gradient-text">Earnings</span></h1>
          <p className="text-slate-400 max-w-2xl mx-auto">Choose a plan that fits your business goals. Get more jobs and pay less commission.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <div 
              key={plan.id}
              className={`glass-card p-8 flex flex-col relative ${plan.popular ? 'border-indigo-500 ring-1 ring-indigo-500/50' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-1 capitalize">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">₹{plan.price}</span>
                  <span className="text-slate-500">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-slate-300">
                    <span className={`text-${plan.color}-500`}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => handleUpgrade(plan.id)}
                disabled={loading || user?.subscription === plan.id}
                className={`w-full py-4 rounded-2xl font-bold transition-all ${
                  user?.subscription === plan.id 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : plan.id === 'free' ? 'bg-slate-800 hover:bg-slate-700' : 'btn-primary'
                }`}
              >
                {loading === plan.id ? 'Processing...' : user?.subscription === plan.id ? 'Current Plan' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 glass-card p-10 border-indigo-500/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Why upgrade to <span className="text-indigo-400">PRO</span>?</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-2xl">📈</div>
                  <div>
                    <h4 className="font-bold">3x More Leads</h4>
                    <p className="text-sm text-slate-400">Pro workers appear at the top of search results, leading to more inquiries.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-2xl">💰</div>
                  <div>
                    <h4 className="font-bold">Lower Commissions</h4>
                    <p className="text-sm text-slate-400">Keep more of what you earn with platform fees reduced to as low as 10%.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800">
              <div className="text-center">
                <p className="text-slate-500 text-sm mb-2">Estimated Monthly Revenue Increase</p>
                <p className="text-5xl font-bold text-white mb-6">+ ₹15,000</p>
                <div className="w-full h-2 bg-slate-800 rounded-full mb-8">
                  <div className="w-3/4 h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" />
                </div>
                <button className="text-indigo-400 font-bold hover:text-indigo-300">Read success stories →</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
