'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: Code & Password
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep(2);
        setMessage('Code sent! Please check your email.');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, password: newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep(3); // Success
        setMessage(data.message);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md glass-card p-8 animate-fade-in shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
            <span className="text-2xl font-bold">MW</span>
          </div>
          <h1 className="text-2xl font-bold">{step === 3 ? 'Success!' : 'Reset Password'}</h1>
          <p className="text-slate-400 text-sm mt-1">
            {step === 1 && "We'll send you a 6-digit code to reset your password"}
            {step === 2 && "Enter the code we sent to your email and your new password"}
            {step === 3 && "Your password has been updated successfully"}
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={handleRequestCode} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {error && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">⚠️ {error}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 justify-center">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send Reset Code'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">6-Digit Code</label>
              <input
                type="text"
                maxLength={6}
                className="input-field text-center tracking-[1em] font-bold text-lg"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">⚠️ {error}</div>}
            {message && <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">✓ {message}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 justify-center">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Reset Password'}
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-slate-400 hover:text-white transition-colors">
              Resend Code
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
            <p className="text-emerald-400 font-medium mb-6">Password successfully reset!</p>
            <Link href="/login" className="btn-primary w-full py-3 justify-center">Go to Login</Link>
          </div>
        )}

        {step !== 3 && (
          <p className="text-center text-slate-400 text-sm mt-6">
            Remembered your password?{' '}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Back to Login</Link>
          </p>
        )}
      </div>
    </div>
  );
}
