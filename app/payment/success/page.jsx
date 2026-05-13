'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [counted, setCounted] = useState(3);

  useEffect(() => {
    // Mark payment as paid
    if (bookingId) {
      fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'paid' }),
      });
    }

    const interval = setInterval(() => {
      setCounted((c) => {
        if (c <= 1) { clearInterval(interval); }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [bookingId]);

  useEffect(() => {
    if (counted === 0) window.location.href = '/bookings';
  }, [counted]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      <div className="glass-card p-12 text-center max-w-md animate-fade-in">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/25 animate-float">
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-3">Payment Successful!</h1>
        <p className="text-slate-400 mb-2">Your booking has been confirmed and payment processed.</p>
        <p className="text-sm text-emerald-400 mb-8">Booking ID: {bookingId?.slice(-8)?.toUpperCase()}</p>

        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="w-16 h-16 rounded-full bg-indigo-600/20 border-2 border-indigo-500/30 flex items-center justify-center">
            <span className="text-2xl font-bold text-indigo-400">{counted}</span>
          </div>
          <p className="text-sm text-slate-400">Redirecting in {counted}s...</p>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/bookings" className="btn-primary py-3 justify-center">View My Bookings</Link>
          <Link href="/" className="btn-secondary py-3">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
