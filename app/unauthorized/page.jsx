'use client';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card p-12 text-center max-w-md animate-fade-in">
        <div className="text-6xl mb-6">🚫</div>
        <h1 className="text-3xl font-bold mb-3">Access Denied</h1>
        <p className="text-slate-400 mb-8">You don't have permission to access this page.</p>
        <div className="flex flex-col gap-3">
          <Link href="/" className="btn-primary py-3 justify-center">Go Home</Link>
          <Link href="/login" className="btn-secondary py-3">Sign in with different account</Link>
        </div>
      </div>
    </div>
  );
}
