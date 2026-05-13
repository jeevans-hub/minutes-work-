'use client';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function WorkerMapPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const [booking, setBooking] = useState(null);
  const [myLocation, setMyLocation] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeBookings, setActiveBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchActiveBookings();
    getMyLocation();
  }, []);

  useEffect(() => {
    if (bookingId && activeBookings.length > 0) {
      const b = activeBookings.find((x) => x._id === bookingId);
      if (b) setSelectedBooking(b);
    }
  }, [bookingId, activeBookings]);

  const fetchActiveBookings = async () => {
    const res = await fetch('/api/bookings');
    if (res.ok) {
      const data = await res.json();
      setActiveBookings(data.bookings.filter((b) => ['accepted', 'inProgress'].includes(b.status)));
    }
  };

  const getMyLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setMyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setMyLocation({ lat: 20.5937, lng: 78.9629 }) // India center fallback
    );
  };

  useEffect(() => {
    if (!myLocation || mapLoaded) return;
    loadGoogleMap();
  }, [myLocation]);

  const loadGoogleMap = () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const isApiKeyValid = apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY';

    if (!isApiKeyValid) {
      setMapLoaded(true);
      return;
    }

    if (window.google) {
      initMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMintWorkMap`;
    script.async = true;
    window.initMintWorkMap = initMap;
    document.head.appendChild(script);
  };

  const initMap = () => {
    if (!mapRef.current || !myLocation) return;
    const center = { lat: myLocation.lat, lng: myLocation.lng };
    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 13,
      center,
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#8ecae6' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2d3561' }] },
        { featureType: 'water', stylers: [{ color: '#0077b6' }] },
      ],
    });
    googleMapRef.current = map;

    // My location marker
    new window.google.maps.Marker({
      position: center,
      map,
      title: 'My Location',
      icon: { url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' },
    });

    // Customer location markers
    activeBookings.forEach((b) => {
      if (b.location?.lat && b.location?.lng) {
        const marker = new window.google.maps.Marker({
          position: { lat: b.location.lat, lng: b.location.lng },
          map,
          title: b.customerId?.name,
        });
        marker.addListener('click', () => setSelectedBooking(b));
      }
    });

    setMapLoaded(true);
  };

  const openDirections = (booking) => {
    if (booking?.location?.lat && booking?.location?.lng) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${booking.location.lat},${booking.location.lng}`;
      window.open(url, '_blank');
    }
  };

  const noApiKey = !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY';

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Job <span className="gradient-text">Map View</span></h1>
          <p className="text-slate-400 mt-1">Navigate to customer locations</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            {noApiKey ? (
              <div className="map-container flex flex-col items-center justify-center bg-slate-900 border border-indigo-500/20">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-xl font-semibold mb-2">Google Maps</h3>
                <p className="text-slate-400 text-sm text-center px-8 mb-4">
                  Add your Google Maps API key to <code className="text-indigo-400">.env.local</code> to enable the interactive map.
                </p>
                <div className="text-xs text-slate-600 bg-slate-800/50 px-4 py-2 rounded-lg font-mono">
                  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
                </div>
              </div>
            ) : (
              <div ref={mapRef} className="map-container" />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="glass-card p-4">
              <h3 className="font-semibold mb-3">Active Jobs ({activeBookings.length})</h3>
              {activeBookings.length === 0 ? (
                <p className="text-sm text-slate-500">No active jobs</p>
              ) : (
                <div className="space-y-3">
                  {activeBookings.map((b) => (
                    <div
                      key={b._id}
                      onClick={() => setSelectedBooking(b)}
                      className={`p-3 rounded-xl cursor-pointer transition-all ${
                        selectedBooking?._id === b._id ? 'bg-indigo-600/20 border border-indigo-500/30' : 'bg-slate-800/40 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="font-medium text-sm">{b.customerId?.name}</div>
                      <div className="text-xs text-slate-400">{b.category}</div>
                      <div className="text-xs text-indigo-400 mt-1 capitalize">{b.status}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedBooking && (
              <div className="glass-card p-4 animate-fade-in">
                <h3 className="font-semibold mb-3">Customer Details</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-slate-400">Name:</span> {selectedBooking.customerId?.name}</div>
                  <div><span className="text-slate-400">Phone:</span> {selectedBooking.customerId?.phone}</div>
                  <div><span className="text-slate-400">Category:</span> {selectedBooking.category}</div>
                  {selectedBooking.location?.address && (
                    <div><span className="text-slate-400">Address:</span> {selectedBooking.location.address}</div>
                  )}
                </div>
                <button
                  onClick={() => openDirections(selectedBooking)}
                  className="btn-primary w-full mt-4 text-sm py-2 justify-center"
                >
                  🧭 Open in Google Maps
                </button>
              </div>
            )}

            {myLocation && (
              <div className="glass-card p-4">
                <h3 className="font-semibold mb-2 text-sm">Your Location</h3>
                <p className="text-xs text-slate-400">
                  {myLocation.lat.toFixed(4)}, {myLocation.lng.toFixed(4)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
