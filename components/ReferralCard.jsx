'use client';
import { useState } from 'react';

export default function ReferralCard({ user }) {
  const [copied, setCopied] = useState(false);

  const referralLink = `${window.location.origin}/register?ref=${user.referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(user.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card p-8 border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-transparent relative overflow-hidden">
      {/* Decorative background circle */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-2xl">🎁</div>
          <div>
            <h3 className="text-xl font-bold">Refer & <span className="gradient-text">Earn</span></h3>
            <p className="text-sm text-slate-400">Invite friends and get ₹100 credits for each!</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Your Referral Code</p>
              <p className="text-2xl font-mono font-bold tracking-wider text-white uppercase">{user.referralCode}</p>
            </div>
            <button 
              onClick={copyToClipboard}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                copied ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-500'
              }`}
            >
              {copied ? 'Copied! ✓' : 'Copy Code'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-700/30 text-center">
              <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Total Referrals</p>
              <p className="text-xl font-bold text-white">{user.referralCount || 0}</p>
            </div>
            <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-700/30 text-center">
              <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Earned Credits</p>
              <p className="text-xl font-bold text-emerald-400">₹{(user.referralCount || 0) * 100}</p>
            </div>
          </div>
          
          <button 
            onClick={() => {
              const text = `Join MintWork and get ₹50 credits! Use my referral code: ${user.referralCode} - ${referralLink}`;
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
            }}
            className="w-full py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/10"
          >
            <span>Share on WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
