'use client';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Welcome to <span className="gradient-text">MintWork</span></h1>
          <p className="text-slate-400 text-lg">Choose your account type to continue</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up">
          {/* Customer Option */}
          <Link href="/login/customer" className="group">
            <div className="glass-card p-8 h-full flex flex-col items-center text-center hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all duration-300">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                <span className="text-4xl">👤</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Customer</h2>
              <p className="text-slate-400 text-sm mb-6">I want to hire skilled workers for my home or business</p>
              <span className="mt-auto btn-primary w-full justify-center">Login as Customer</span>
            </div>
          </Link>

          {/* Worker Option */}
          <Link href="/login/worker" className="group">
            <div className="glass-card p-8 h-full flex flex-col items-center text-center hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <span className="text-4xl">👷</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Worker</h2>
              <p className="text-slate-400 text-sm mb-6">I want to find jobs, manage my schedule and earn money</p>
              <span className="mt-auto btn-primary bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-none w-full justify-center">Login as Worker</span>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center space-y-3">
          <p className="text-slate-500 text-sm">
            Don't have an account yet? <Link href="/register" className="text-indigo-400 hover:underline">Create one here</Link>
          </p>
          <p className="text-slate-500 text-xs pt-2">
            Are you an administrator?{' '}
            <Link href="/login/admin" className="text-rose-400 hover:underline font-medium">
              Admin Login Portal →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
