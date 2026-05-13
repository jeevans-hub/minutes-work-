/**
 * Haversine formula to calculate distance between two lat/lng points
 * @returns distance in kilometers
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Sort workers by distance from user, then by rating
 */
export function sortWorkersByProximityAndRating(workers, userLat, userLng) {
  return workers
    .map((worker) => ({
      ...worker,
      distance: haversineDistance(
        userLat,
        userLng,
        worker.location?.lat || 0,
        worker.location?.lng || 0
      ),
    }))
    .sort((a, b) => {
      if (Math.abs(a.distance - b.distance) < 1) {
        return b.rating - a.rating;
      }
      return a.distance - b.distance;
    });
}

/**
 * Filter workers within a given radius (km)
 */
export function filterWorkersByRadius(workers, userLat, userLng, radiusKm) {
  return workers.filter((worker) => {
    const dist = haversineDistance(
      userLat,
      userLng,
      worker.location?.lat || 0,
      worker.location?.lng || 0
    );
    return dist <= radiusKm;
  });
}
