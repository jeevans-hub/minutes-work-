'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';

import { GOOGLE_MAPS_LIBRARIES } from '@/lib/mapConfig';
import ChatBox from '@/components/ChatBox';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import InvoicePDF from '@/components/InvoicePDF';
import ReviewForm from '@/components/ReviewForm';
import { useRef } from 'react';

const STATUS_TIMELINE = ['accepted', 'onTheWay', 'arrived', 'inProgress', 'completed'];
const STATUS_LABELS = {
  accepted: 'Assigned',
  onTheWay: 'On The Way',
  arrived: 'Arrived',
  inProgress: 'In Progress',
  completed: 'Completed'
};

const mapContainerStyle = { width: '100%', height: '100%', borderRadius: '0.75rem' };

export default function BookingDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [directions, setDirections] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeData, setDisputeData] = useState({ reason: '', details: '' });
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);
  const invoiceRef = useRef(null);

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const isApiKeyValid = googleMapsApiKey && googleMapsApiKey !== 'YOUR_GOOGLE_MAPS_API_KEY';

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: isApiKeyValid ? googleMapsApiKey : '',
    libraries: GOOGLE_MAPS_LIBRARIES
  });

  const fetchBooking = useCallback(async () => {
    try {
      const res = await fetch(`/api/bookings/${id}`);
      if (res.ok) {
        const data = await res.json();
        setBooking(data.booking);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBooking();
    // Poll for live tracking updates
    const interval = setInterval(fetchBooking, 10000);
    return () => clearInterval(interval);
  }, [fetchBooking]);

  useEffect(() => {
    if (!isLoaded || !booking) return;

    // If worker is on the way and we have both locations, calculate route
    if (booking.status === 'onTheWay' && booking.workerLocation?.lat && booking.location?.lat) {
      const directionsService = new window.google.maps.DirectionsService();

      directionsService.route(
        {
          origin: booking.workerLocation,
          destination: booking.location,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
          }
        }
      );
    }
  }, [isLoaded, booking?.status, booking?.workerLocation?.lat, booking?.location?.lat]);

  if (loading) return <div className="min-h-screen pt-24 text-center">Loading...</div>;
  if (!booking) return <div className="min-h-screen pt-24 text-center">Booking not found.</div>;

  const currentStatusIndex = STATUS_TIMELINE.indexOf(booking.status);
  const isTrackingActive = ['accepted', 'onTheWay', 'arrived'].includes(booking.status);

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    setDownloading(true);
    try {
      // Temporarily show the invoice to capture it
      invoiceRef.current.parentElement.classList.remove('hidden');
      const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
      invoiceRef.current.parentElement.classList.add('hidden');

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`MintWork_Invoice_${booking._id.slice(-8)}.pdf`);
    } catch (e) {
      console.error(e);
      alert('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handleEmailInvoice = async () => {
    setEmailing(true);
    try {
      const res = await fetch(`/api/bookings/${booking._id}/invoice`, { method: 'POST' });
      if (res.ok) alert('Invoice sent to your email successfully!');
      else alert('Failed to send email.');
    } catch (e) {
      console.error(e);
      alert('Failed to send email.');
    } finally {
      setEmailing(false);
    }
  };

  const handleRaiseDispute = async (e) => {
    e.preventDefault();
    setDisputeSubmitting(true);
    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking._id,
          reason: disputeData.reason,
          details: disputeData.details,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setShowDisputeModal(false);
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to submit dispute');
    } finally {
      setDisputeSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Col: Details & Status */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6">
            <h1 className="text-2xl font-bold mb-4">Live <span className="gradient-text">Tracking</span></h1>

            <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-slate-800/50">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xl font-bold">
                {booking.workerId?.name?.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-white">{booking.workerId?.name}</h3>
                <p className="text-sm text-slate-400">{booking.category}</p>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="relative pl-4 space-y-6 before:absolute before:inset-y-2 before:left-[23px] before:w-0.5 before:bg-slate-700">
              {STATUS_TIMELINE.map((step, idx) => {
                const isActive = idx === currentStatusIndex;
                const isPassed = idx < currentStatusIndex;
                return (
                  <div key={step} className={`relative flex gap-4 ${isPassed || isActive ? 'text-white' : 'text-slate-500'}`}>
                    <div className={`relative z-10 w-4 h-4 rounded-full mt-1 shrink-0 ${isActive ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' :
                      isPassed ? 'bg-emerald-500' : 'bg-slate-700'
                      }`} />
                    <div>
                      <div className={`font-semibold ${isActive ? 'text-indigo-400' : ''}`}>
                        {STATUS_LABELS[step]}
                      </div>
                      {isActive && step === 'onTheWay' && (
                        <p className="text-xs text-indigo-300 mt-1 animate-pulse">Worker is driving to your location...</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-semibold mb-3">Job Details</h3>
            <div className="text-sm space-y-2 text-slate-400 mb-4">
              <p><strong className="text-slate-300">Address:</strong> {booking.location?.address}</p>
              <p><strong className="text-slate-300">Payment:</strong> {booking.paymentType}</p>
              <p><strong className="text-slate-300">Problem:</strong> {booking.description}</p>
            </div>
            <button
              onClick={() => setShowDisputeModal(true)}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
            >
              🚩 Report an issue / Raise dispute
            </button>
          </div>

          {booking.status === 'completed' && (
            <div className="glass-card p-6 border-indigo-500/30 border bg-indigo-900/10">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span>📄</span> Billing & Invoice
              </h3>
              <div className="text-sm text-slate-300 mb-4">
                Your service is complete! You can download a PDF receipt or have it emailed to you.
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDownloadPDF}
                  disabled={downloading}
                  className="flex-1 btn-primary py-2 text-sm justify-center flex items-center gap-2"
                >
                  {downloading ? 'Generating...' : '📥 Download PDF'}
                </button>
                <button
                  onClick={handleEmailInvoice}
                  disabled={emailing}
                  className="flex-1 btn-secondary py-2 text-sm justify-center flex items-center gap-2"
                >
                  {emailing ? 'Sending...' : '✉️ Email Me'}
                </button>
              </div>
            </div>
          )}

          {booking.status === 'completed' && user?.role === 'customer' && !booking.rating && (
            <ReviewForm bookingId={booking._id} onReviewSubmitted={fetchBooking} />
          )}

          {booking.status === 'completed' && booking.rating && (
            <div className="glass-card p-6 border-emerald-500/20 border">
              <h3 className="font-semibold mb-2">Thank you for your feedback!</h3>
              <div className="flex gap-1 text-amber-400 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i}>{i < booking.rating ? '★' : '☆'}</span>
                ))}
              </div>
              {booking.review && <p className="text-sm text-slate-400 italic">&ldquo;{booking.review}&rdquo;</p>}
            </div>
          )}
        </div>

        {/* Right Col: Map & Chat */}
        <div className="lg:col-span-2 space-y-6 flex flex-col h-[80vh]">
          {/* Map */}
          <div className="glass-card p-2 flex-1 relative min-h-[300px]">
            {isApiKeyValid ? (
              !isLoaded ? (
                <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                  <span className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mr-3" />
                  Loading map...
                </div>
              ) : (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={booking.location?.lat ? booking.location : { lat: 0, lng: 0 }}
                  zoom={14}
                  options={{ disableDefaultUI: true, styles: [{ stylers: [{ invert_lightness: true }] }] }}
                >
                  {/* Destination Marker */}
                  {booking.location?.lat && (
                    <Marker position={booking.location} icon="https://maps.google.com/mapfiles/ms/icons/red-dot.png" />
                  )}

                  {/* Worker Marker */}
                  {isTrackingActive && booking.workerLocation?.lat && (
                    <Marker position={booking.workerLocation} icon="https://maps.google.com/mapfiles/ms/icons/blue-dot.png" />
                  )}

                  {/* Route */}
                  {directions && <DirectionsRenderer directions={directions} options={{ suppressMarkers: true }} />}
                </GoogleMap>
              )
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-slate-900/50">
                <div className="text-3xl mb-3">📍</div>
                <h4 className="text-sm font-semibold text-white mb-1">Live Map Unavailable</h4>
                <p className="text-[11px] text-slate-400 max-w-[200px]">
                  Google Maps API key is not configured.
                </p>
              </div>
            )}
          </div>

          {/* Chat Container */}
          <div className="glass-card flex-1 flex flex-col overflow-hidden min-h-[300px]">
            <div className="p-4 border-b border-slate-700 bg-slate-800/30">
              <h3 className="font-semibold text-white">
                Chat with {user?.role === 'customer' ? booking.workerId?.name : booking.customerId?.name}
              </h3>
            </div>
            {isTrackingActive || booking.status === 'completed' ? (
              <ChatBox bookingId={booking._id} otherUser={user?.role === 'customer' ? booking.workerId : booking.customerId} />
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 p-6 text-center">
                Chat will be available once a worker accepts the booking.
              </div>
            )}
          </div>
        </div>

        {/* Hidden Invoice PDF Template */}
        <InvoicePDF ref={invoiceRef} booking={booking} />
      </div>

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md p-8 shadow-2xl relative">
            <button
              onClick={() => setShowDisputeModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-2">Raise a <span className="text-rose-500">Dispute</span></h2>
            <p className="text-sm text-slate-400 mb-6">Tell us what went wrong. Our admin team will investigate and resolve this within 24-48 hours.</p>

            <form onSubmit={handleRaiseDispute} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Reason for dispute</label>
                <select
                  required
                  className="input-field"
                  value={disputeData.reason}
                  onChange={(e) => setDisputeData({ ...disputeData, reason: e.target.value })}
                >
                  <option value="">Select a reason</option>
                  <option value="No Show">Worker didn't show up</option>
                  <option value="Poor Quality">Poor quality of work</option>
                  <option value="Overcharged">Incorrect pricing / Overcharged</option>
                  <option value="Unprofessional">Unprofessional behavior</option>
                  <option value="Other">Other issue</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Detailed Description</label>
                <textarea
                  required
                  placeholder="Provide more details about the issue..."
                  className="input-field min-h-[120px]"
                  value={disputeData.details}
                  onChange={(e) => setDisputeData({ ...disputeData, details: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={disputeSubmitting}
                  className="flex-1 btn-danger"
                >
                  {disputeSubmitting ? 'Submitting...' : 'Raise Dispute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
