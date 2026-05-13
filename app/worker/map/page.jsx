'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function WorkerMapContent() {
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

      setActiveBookings(
        data.bookings.filter((b) =>
          ['accepted', 'inProgress'].includes(b.status)
        )
      );
    }
  };

  const getMyLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) =>
        setMyLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => setMyLocation({ lat: 20.5937, lng: 78.9629 })
    );
  };

  useEffect(() => {
    if (!myLocation || mapLoaded) return;
    loadGoogleMap();
  }, [myLocation]);

  const loadGoogleMap = () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    const isApiKeyValid =
      apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY';

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

    const center = {
      lat: myLocation.lat,
      lng: myLocation.lng,
    };

    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 13,
      center,
    });

    googleMapRef.current = map;

    new window.google.maps.Marker({
      position: center,
      map,
      title: 'My Location',
    });

    activeBookings.forEach((b) => {
      if (b.location?.lat && b.location?.lng) {
        const marker = new window.google.maps.Marker({
          position: {
            lat: b.location.lat,
            lng: b.location.lng,
          },
          map,
          title: b.customerId?.name,
        });

        marker.addListener('click', () =>
          setSelectedBooking(b)
        );
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

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          Job Map View
        </h1>

        <div ref={mapRef} className="map-container mb-6" />

        {selectedBooking && (
          <button
            onClick={() => openDirections(selectedBooking)}
            className="btn-primary"
          >
            Open Directions
          </button>
        )}
      </div>
    </div>
  );
}

export default function WorkerMapPage() {
  return (
    <Suspense fallback={<div>Loading map...</div>}>
      <WorkerMapContent />
    </Suspense>
  );
}
