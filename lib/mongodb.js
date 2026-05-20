import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

console.log('\n==============================');
console.log('[MongoDB] Step 0: Module loaded');
console.log('==============================\n');

if (!MONGODB_URI) {
  console.error('[MongoDB] ❌ ERROR: MONGODB_URI missing in environment');
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

console.log('[MongoDB] Step 1: MONGODB_URI found');

// Mask URI for safe logs
const maskedURI = MONGODB_URI.replace(/\/\/.*:.*@/, '//****:****@');
console.log('[MongoDB] URI:', maskedURI);

// Global cache setup
let cached = global.mongoose;

if (!cached) {
  console.log('[MongoDB] Step 2: Creating mongoose cache');
  cached = global.mongoose = { conn: null, promise: null };
} else {
  console.log('[MongoDB] Step 2: Using existing mongoose cache');
}

async function connectDB() {
  console.log('\n==============================');
  console.log('[MongoDB] Step 3: connectDB() called');
  console.log('==============================\n');

  if (cached.conn) {
    console.log('[MongoDB] Step 4: Using cached connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('[MongoDB] Step 5: Creating new connection promise');

    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      connectTimeoutMS: 5000,
    };

    console.log('[MongoDB] Step 6: Connecting to MongoDB Atlas...');

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  } else {
    console.log('[MongoDB] Step 5: Reusing existing connection promise');
  }

  try {
    console.log('[MongoDB] Step 7: Waiting for connection...');
    cached.conn = await cached.promise;

    console.log('\n==============================');
    console.log('[MongoDB] ✅ SUCCESS: Connected');
    console.log('[MongoDB] Host:', cached.conn.connection.host);
    console.log('[MongoDB] Database:', cached.conn.connection.name);
    console.log('==============================\n');

  } catch (e) {
    console.error('\n==============================');
    console.error('[MongoDB] ❌ CONNECTION FAILED');
    console.error('==============================');

    const message = e.message || e.toString();
    console.error('[MongoDB] Raw Error:', message);

    // -------------------------------
    // ROOT CAUSE DETECTOR
    // -------------------------------
    let cause = 'UNKNOWN_ERROR';

    if (message.includes('bad auth')) {
      cause = 'AUTHENTICATION_FAILED → Wrong username/password OR password not URL encoded';
    } 
    else if (message.includes('ENOTFOUND') || message.includes('getaddrinfo')) {
      cause = 'DNS_RESOLUTION_FAILED → Cluster hostname not reachable';
    } 
    else if (message.includes('ECONNREFUSED')) {
      cause = 'CONNECTION_REFUSED → Firewall or network blocking connection';
    } 
    else if (message.includes('timed out')) {
      cause = 'TIMEOUT → Atlas not responding or slow network';
    } 
    else if (message.includes('IP')) {
      cause = 'IP_NOT_WHITELISTED → Atlas blocked your IP address';
    }

    console.error('\n🚨 ROOT CAUSE DETECTED:\n');
    console.error(cause);
    console.error('\n==============================\n');

    cached.promise = null;
    cached.conn = null;

    throw e;
  }

  return cached.conn;
}

export default connectDB;