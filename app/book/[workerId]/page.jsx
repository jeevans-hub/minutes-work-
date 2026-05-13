'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function BookWorkerPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { workerId } = useParams();

  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    category: '',
    description: '',
    address: '',
    paymentType: 'cash',
    selectedDate: new Date().toISOString().split('T')[0],
    selectedTime: null,
  });
  const [slots, setSlots] = useState([]);

  const BASE_AMOUNT = 150;
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [useWallet, setUseWallet] = useState(false);

  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (workerId) {
      fetchWorker();
      getLocation();
    }
  }, [workerId]);

  useEffect(() => {
    if (workerId && form.selectedDate) {
      fetch(`/api/workers/${workerId}/slots?date=${form.selectedDate}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.slots) setSlots(data.slots);
          setForm((prev) => ({ ...prev, selectedTime: null }));
        });
    }
  }, [workerId, form.selectedDate]);

  const fetchWorker = async () => {
    try {
      const res = await fetch(`/api/workers/${workerId}`);

      if (res.ok) {
        const data = await res.json();

        setWorker(data.worker);

        setForm((prev) => ({
          ...prev,
          category: data.worker.category || '',
        }));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode) return;
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAppliedCoupon({ percentage: data.discountPercentage, max: data.maxDiscount });
        setError('');
      } else {
        setError(data.error || 'Invalid coupon');
        setAppliedCoupon(null);
      }
    } catch (e) {
      setError('Failed to validate coupon');
    }
  };

  const discountAmount = appliedCoupon 
    ? Math.min((BASE_AMOUNT * appliedCoupon.percentage) / 100, appliedCoupon.max) 
    : 0;
  const totalAfterDiscount = BASE_AMOUNT - discountAmount;
  const walletAvailable = user?.walletBalance || 0;
  const walletUsed = useWallet ? Math.min(totalAfterDiscount, walletAvailable) : 0;
  const finalAmount = totalAfterDiscount - walletUsed;

  const getLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) =>
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => {}
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          workerId,
          category: form.category,
          description: form.description,

          location: {
            address: form.address,
            ...userLocation,
          },

          paymentType: form.paymentType,
          scheduledAt: form.selectedDate && form.selectedTime 
            ? new Date(`${form.selectedDate}T${form.selectedTime.toString().padStart(2, '0')}:00:00`).toISOString()
            : null,
          amount: finalAmount,
          discountAmount,
          walletUsed,
          couponCode: appliedCoupon ? couponCode : null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (form.paymentType === 'online') {
          router.push(`/payment/success?bookingId=${data.booking._id}`);
        } else {
          setSuccess(true);

          setTimeout(() => {
            router.push('/bookings');
          }, 2500);
        }
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.log(error);
      setError('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-4">
        <div className="glass-card p-12 text-center max-w-md animate-fade-in">
          <div className="text-6xl mb-4 animate-float">🎉</div>

          <h2 className="text-2xl font-bold mb-2 gradient-text">
            Booking Confirmed!
          </h2>

          <p className="text-slate-400 mb-2">
            Your booking has been sent to {worker?.name}.
          </p>

          <p className="text-sm text-slate-500">
            Redirecting to your bookings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-2xl mx-auto">
        {/* Worker Info */}
        {worker && (
          <div className="glass-card p-6 mb-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-2xl font-bold">
              {worker.name?.charAt(0)}
            </div>

            <div>
              <h2 className="text-xl font-bold">{worker.name}</h2>

              <div className="text-sm text-slate-400">
                {worker.category} • {worker.experience || 0} yrs exp
              </div>

              <div className="flex items-center gap-1 mt-1">
                <span className="text-amber-400">★</span>

                <span className="text-sm text-slate-300">
                  {worker.rating?.toFixed(1) || '0.0'} (
                  {worker.ratingCount || 0} reviews)
                </span>
              </div>
            </div>

            {worker.isAvailable ? (
              <span className="ml-auto inline-flex items-center gap-1 text-sm text-emerald-400">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                Available
              </span>
            ) : (
              <span className="ml-auto text-sm text-rose-400">
                Unavailable
              </span>
            )}
          </div>
        )}

        {/* Booking Form */}
        <div className="glass-card p-8">
          <h1 className="text-2xl font-bold mb-6">Book Service</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Service Category *
              </label>

              <select
                className="input-field"
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                required
              >
                {[
                  'Plumber',
                  'Electrician',
                  'Carpenter',
                  'Cleaner',
                  'Painter',
                  'HVAC',
                  'Mason',
                  'Gardener',
                  'Other',
                ].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Describe Your Problem *
              </label>

              <textarea
                className="input-field min-h-[100px] resize-none"
                placeholder="E.g., My kitchen faucet is leaking and needs replacement..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                required
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Service Address
              </label>

              <input
                type="text"
                className="input-field"
                placeholder="Enter your full address"
                value={form.address}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
              />

              {userLocation && (
                <p className="text-xs text-emerald-400 mt-1">
                  📍 Location detected automatically
                </p>
              )}
            </div>

            {/* Date & Time Slots */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Scheduled Date & Time *
              </label>

              <input
                type="date"
                className="input-field mb-4"
                value={form.selectedDate}
                onChange={(e) => setForm({ ...form, selectedDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
              />

              {form.selectedDate && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.length === 0 ? (
                    <div className="col-span-full text-slate-500 text-sm py-2">Loading slots...</div>
                  ) : (
                    slots.map((slot) => (
                      <button
                        key={slot.hour}
                        type="button"
                        disabled={!slot.isAvailable}
                        onClick={() => setForm({ ...form, selectedTime: slot.hour })}
                        className={`py-2 px-1 text-xs rounded-lg font-medium border transition-all ${
                          !slot.isAvailable 
                            ? 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed opacity-50' 
                            : form.selectedTime === slot.hour
                              ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                              : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-indigo-500/50 hover:bg-slate-700'
                        }`}
                      >
                        {slot.timeString}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Promo Code & Wallet */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Promo Code</label>
                <div className="flex gap-2">
                  <input type="text" className="input-field flex-1 uppercase" placeholder="Enter code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} />
                  <button type="button" onClick={applyCoupon} className="btn-secondary px-4">Apply</button>
                </div>
                {appliedCoupon && <p className="text-xs text-emerald-400 mt-1">Coupon applied! {appliedCoupon.percentage}% off.</p>}
              </div>

              {user && (
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-700 bg-slate-800/30">
                  <div>
                    <div className="font-medium">Use Wallet Balance</div>
                    <div className="text-xs text-slate-400">Available: ${user.walletBalance?.toFixed(2) || '0.00'}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={useWallet} onChange={() => setUseWallet(!useWallet)} disabled={!user.walletBalance} />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              )}

              {/* Order Summary */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-2 text-sm">
                <div className="flex justify-between text-slate-400"><span>Base Service Fee</span><span>${BASE_AMOUNT.toFixed(2)}</span></div>
                {discountAmount > 0 && <div className="flex justify-between text-emerald-400"><span>Discount</span><span>-${discountAmount.toFixed(2)}</span></div>}
                {walletUsed > 0 && <div className="flex justify-between text-indigo-400"><span>Wallet Applied</span><span>-${walletUsed.toFixed(2)}</span></div>}
                <div className="h-px bg-slate-800 my-2"></div>
                <div className="flex justify-between font-bold text-lg"><span>Total to Pay</span><span>${finalAmount.toFixed(2)}</span></div>
              </div>
            </div>

            {/* Payment */}
            {finalAmount > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Payment Method
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    value: 'cash',
                    label: 'Cash on Service',
                    icon: '💵',
                    desc: 'Pay after job is done',
                  },
                  {
                    value: 'online',
                    label: 'Online Payment',
                    icon: '💳',
                    desc: 'Pay now securely',
                  },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        paymentType: opt.value,
                      })
                    }
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      form.paymentType === opt.value
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-2xl mb-2">{opt.icon}</div>

                    <div className="text-sm font-medium text-white">
                      {opt.label}
                    </div>

                    <div className="text-xs text-slate-500 mt-0.5">
                      {opt.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-rose-400 text-sm">
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || !worker?.isAvailable || !form.selectedTime}
              className="btn-primary w-full py-3.5 justify-center text-base"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : form.paymentType === 'online' ? (
                '💳 Pay & Book'
              ) : (
                '📋 Confirm Booking'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}