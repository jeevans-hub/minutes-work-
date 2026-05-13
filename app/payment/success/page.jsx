'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [counted, setCounted] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounted((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (counted === 0) {
      window.location.href = '/dashboard';
    }
  }, [counted]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-slate-950">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="glass-card p-10 md:p-14 text-center max-w-lg w-full animate-fade-in relative z-10 border border-white/5 shadow-2xl backdrop-blur-xl bg-white/5 rounded-3xl">
        {/* Animated Success Icon */}
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(16,185,129,0.3)] animate-float">
          <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Payment Successful!
        </h1>
        <p className="text-slate-400 text-lg mb-6 leading-relaxed">
          Thank you for your payment. Your transaction has been completed successfully and a receipt has been emailed to you.
        </p>

        {sessionId && (
          <div className="inline-block px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8">
            <p className="text-sm font-mono text-emerald-400">
              Session ID: <span className="text-emerald-300">{sessionId}</span>
            </p>
          </div>
        )}

        <div className="flex flex-col items-center gap-3 mb-10">
          <div className="relative">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-white/10"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray="175.9"
                strokeDashoffset={175.9 - (175.9 * counted) / 5}
                className="text-emerald-500 transition-all duration-1000 ease-linear"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
              {counted}
            </span>
          </div>
          <p className="text-sm text-slate-500 font-medium">Redirecting to dashboard...</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link 
            href="/dashboard" 
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            Go to Dashboard
          </Link>
          <Link 
            href="/" 
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 border border-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-slate-400 font-medium animate-pulse">Confirming payment...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
