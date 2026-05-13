// Simple in-memory cache layer to simulate Redis for Edge/Server environments
const cache = new Map();

export const getCache = (key) => {
  const cached = cache.get(key);
  if (!cached) return null;

  const now = Date.now();
  if (now > cached.expiry) {
    cache.delete(key);
    return null;
  }

  return cached.value;
};

export const setCache = (key, value, ttlSeconds = 60) => {
  const expiry = Date.now() + ttlSeconds * 1000;
  cache.set(key, { value, expiry });
};

export const clearCache = (key) => {
  cache.delete(key);
};
