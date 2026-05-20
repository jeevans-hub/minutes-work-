'use client';
import { Suspense, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Autocomplete } from '@react-google-maps/api';

const CATEGORIES = ['all', 'Plumber', 'Electrician', 'Carpenter', 'Cleaner', 'Painter', 'HVAC', 'Mason', 'Gardener'];
const CAT_ICONS = { all: '🔧', Plumber: '🔧', Electrician: '⚡', Carpenter: '🪚', Cleaner: '🧹', Painter: '🎨', HVAC: '❄️', Mason: '🧱', Gardener: '🌿' };

import { GOOGLE_MAPS_LIBRARIES } from '@/lib/mapConfig';
const mapContainerStyle = { width: '100%', height: '100%' };

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`text-sm ${i < Math.round(rating) ? 'text-amber-400' : 'text-slate-600'}`}>★</span>
      ))}
      <span className="text-xs text-slate-400 ml-1">({rating?.toFixed(1) || '0.0'})</span>
    </div>
  );
}

function WorkerCard({ worker }) {
  const distText = worker.distance != null && worker.distance < 9999
    ? worker.distance < 1 ? `${Math.round(worker.distance * 1000)}m away` : `${worker.distance.toFixed(1)}km away`
    : null;

  const isPro = worker.subscription === 'pro' || worker.subscription === 'elite';
  const isElite = worker.subscription === 'elite';

  return (
    <div className={`glass-card p-6 group hover:-translate-y-1 transition-all duration-300 relative ${isElite ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]' :
      isPro ? 'border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : ''
      }`}>
      {isPro && (
        <div className={`absolute -top-3 left-6 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${isElite ? 'bg-amber-500 text-amber-950' : 'bg-indigo-600 text-white'
          }`}>
          {isElite ? '👑 Elite Pro' : '⭐ Pro'}
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-2xl font-bold shadow-lg ${isElite ? 'from-amber-400 to-orange-500' : 'from-indigo-500 to-violet-600'
          }`}>
          {worker.avatar || worker.name?.charAt(0)?.toUpperCase()}
        </div>
        <div className="text-right">
          {distText && (
            <div className="text-xs text-emerald-400 font-medium">📍 {distText}</div>
          )}
          {worker.isAvailable ? (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-400 mt-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />Available
            </span>
          ) : (
            <span className="text-xs text-slate-500">Unavailable</span>
          )}
        </div>
      </div>

      <h3 className="font-bold text-white text-lg mb-1">{worker.name}</h3>
      <div className="flex items-center gap-2 mb-2">
        <span className="badge bg-indigo-500/20 text-indigo-300">{CAT_ICONS[worker.category]} {worker.category}</span>
        {worker.isVerified && <span className="text-xs text-emerald-400">✓ Verified</span>}
      </div>

      <StarRating rating={worker.rating} />
      <p className="text-xs text-slate-400 mt-1">{worker.ratingCount || 0} reviews</p>

      <div className="mt-3 text-sm text-slate-400">
        <span>🕐 {worker.experience || 0} yrs exp</span>
        {worker.skills?.length > 0 && <span className="ml-3">🛠 {worker.skills.slice(0, 2).join(', ')}</span>}
      </div>

      {worker.bio && <p className="text-xs text-slate-500 mt-3 line-clamp-2">{worker.bio}</p>}

      <div className="mt-4 flex gap-2">
        <Link href={`/book/${worker._id}`} className="btn-primary flex-1 text-sm py-2 justify-center text-center">
          Book Now
        </Link>
        <Link href={`/workers/${worker._id}`} className="btn-secondary text-sm py-2 px-4">
          View
        </Link>
      </div>
    </div>
  );
}

function WorkersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [selectedWorker, setSelectedWorker] = useState(null);
  const autocompleteRef = useRef(null);

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const isApiKeyValid = googleMapsApiKey && googleMapsApiKey !== 'YOUR_GOOGLE_MAPS_API_KEY';

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: isApiKeyValid ? googleMapsApiKey : '',
    libraries: GOOGLE_MAPS_LIBRARIES
  });

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current.getPlace();
    if (place.geometry) {
      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        address: place.formatted_address
      };
      setUserLocation(location);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [category, userLocation]);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.set('category', category);
      if (userLocation) {
        params.set('lat', userLocation.lat);
        params.set('lng', userLocation.lng);
      }
      if (search) params.set('search', search);
      params.set('radius', '50');

      const res = await fetch(`/api/workers?${params}`);
      if (res.ok) {
        const data = await res.json();
        setWorkers(data.workers);
      }
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWorkers();
  };

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Find <span className="gradient-text">Skilled Workers</span></h1>
            <p className="text-slate-400">Sorted by proximity and ratings</p>
          </div>

          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
            >
              📋 List View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'map' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
            >
              🗺️ Map View
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="glass-card p-5 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="flex-1">
              {isApiKeyValid && isLoaded ? (
                <Autocomplete
                  onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                  onPlaceChanged={handlePlaceSelect}
                >
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter an address or area..."
                    defaultValue={userLocation?.address || ''}
                  />
                </Autocomplete>
              ) : (
                <input
                  type="text"
                  className="input-field"
                  placeholder={isApiKeyValid ? "Loading search..." : "Address search disabled (API key required)"}
                  disabled
                />
              )}
            </div>

            <input
              type="text"
              className="input-field max-w-[200px]"
              placeholder="Search skill (e.g. pipe)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button
              type="button"
              onClick={getLocation}
              disabled={locating}
              className={`btn-secondary px-4 flex items-center gap-2 ${locating ? 'opacity-50' : ''}`}
            >
              {locating ? (
                <span className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
              ) : '📍'}
              Detect
            </button>
            <button type="submit" className="btn-primary px-8">Find</button>
          </form>

          {/* Category filter */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${category === cat
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
              >
                <span>{CAT_ICONS[cat]}</span>
                <span>{cat === 'all' ? 'All Categories' : cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Location banner */}
        {userLocation && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
            <span>📍</span>
            <span>Showing workers near your location, sorted by distance</span>
            <button onClick={() => setUserLocation(null)} className="ml-auto text-slate-500 hover:text-white text-xs">Clear</button>
          </div>
        )}

        {/* Results */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-slate-400">{workers.length} workers found</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="w-14 h-14 rounded-2xl bg-slate-700 mb-4" />
                <div className="h-4 bg-slate-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-700 rounded w-1/2 mb-4" />
                <div className="h-8 bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        ) : workers.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No workers found</h3>
            <p className="text-slate-400 mb-4">Try a different category or expand your search area</p>
            <button onClick={() => { setCategory('all'); setSearch(''); setUserLocation(null); }} className="btn-secondary">
              Clear Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workers.map((w) => <WorkerCard key={w._id} worker={w} />)}
          </div>
        ) : (
          <div className="glass-card overflow-hidden h-[600px] relative border-indigo-500/20">
            {isApiKeyValid ? (
              isLoaded ? (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={userLocation?.lat ? { lat: userLocation.lat, lng: userLocation.lng } : { lat: 20.5937, lng: 78.9629 }}
                  zoom={userLocation?.lat ? 12 : 5}
                  options={{ styles: [{ stylers: [{ invert_lightness: true }] }] }}
                >
                  {workers.map((w) => w.location?.lat && (
                    <Marker
                      key={w._id}
                      position={w.location}
                      onClick={() => setSelectedWorker(w)}
                      icon="https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                    />
                  ))}

                  {selectedWorker && (
                    <InfoWindow
                      position={selectedWorker.location}
                      onCloseClick={() => setSelectedWorker(null)}
                    >
                      <div className="p-2 min-w-[200px] text-slate-900">
                        <h4 className="font-bold">{selectedWorker.name}</h4>
                        <p className="text-xs text-slate-500 mb-2">{selectedWorker.category}</p>
                        <StarRating rating={selectedWorker.rating} />
                        <Link
                          href={`/workers/${selectedWorker._id}`}
                          className="mt-2 block text-center py-1.5 bg-indigo-600 text-white text-xs rounded-lg font-bold"
                        >
                          View Profile
                        </Link>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 font-medium">
                  <span className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mr-3" />
                  Loading Map...
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-8 bg-slate-900/50">
                <div className="text-4xl mb-4">🗺️</div>
                <h4 className="text-lg font-semibold text-white mb-2">Map View Disabled</h4>
                <p className="text-sm text-slate-400 max-w-sm">
                  Please configure your <code className="text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in <code className="text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">.env.local</code> to enable the interactive map.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function WorkersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <WorkersContent />
    </Suspense>
  );
}
