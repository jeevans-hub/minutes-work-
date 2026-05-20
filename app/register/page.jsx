'use client';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-3xl relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Join <span className="gradient-text">MintWork</span></h1>
          <p className="text-slate-400 text-lg">Select how you want to use the platform</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 animate-fade-in-up">
          {/* Customer Registration */}
          <Link href="/register/customer" className="group">
            <div className="glass-card p-10 h-full flex flex-col items-center text-center hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all duration-300">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-8 shadow-xl shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                <span className="text-5xl">📱</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Customer</h2>
              <p className="text-slate-400 text-base mb-8">I'm here to find and book reliable services for my home or office.</p>
              <ul className="text-left text-sm text-slate-500 space-y-3 mb-10 w-full">
                <li className="flex items-center gap-2"><span className="text-indigo-400">✓</span> Instant booking with verified workers</li>
                <li className="flex items-center gap-2"><span className="text-indigo-400">✓</span> Secure payments & transparent pricing</li>
                <li className="flex items-center gap-2"><span className="text-indigo-400">✓</span> Real-time tracking & reviews</li>
              </ul>
              <span className="mt-auto btn-primary w-full py-4 justify-center text-lg">Join as Customer</span>
            </div>
          </Link>

          {/* Worker Registration */}
          <Link href="/register/worker" className="group">
            <div className="glass-card p-10 h-full flex flex-col items-center text-center hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-8 shadow-xl shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <span className="text-5xl">🛠️</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Worker</h2>
              <p className="text-slate-400 text-base mb-8">I'm a professional looking to provide services and grow my business.</p>
              <ul className="text-left text-sm text-slate-500 space-y-3 mb-10 w-full">
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Find high-paying jobs in your area</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Set your own schedule & pricing</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Build your professional reputation</li>
              </ul>
              <span className="mt-auto btn-primary bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-none w-full py-4 justify-center text-lg">Join as Worker</span>
            </div>
          </Link>
        </div>

        <p className="text-center text-slate-500 mt-12 text-sm">
          Already have an account? <Link href="/login" className="text-indigo-400 hover:underline">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}
