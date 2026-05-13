import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Booking from '@/models/Booking';
import { getUserFromRequest } from '@/lib/auth';
import { haversineDistance } from '@/lib/haversine';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radius = parseFloat(searchParams.get('radius') || '50');
    const search = searchParams.get('search') || '';

    // DYNAMIC PRICING LOGIC
    let surgeMultiplier = 1.0;
    if (category && category !== 'all') {
      const activeBookings = await Booking.countDocuments({ 
        category, 
        status: { $in: ['pending', 'accepted', 'inProgress'] } 
      });
      const availableWorkers = await User.countDocuments({ category, role: 'worker', isAvailable: true });
      
      if (activeBookings > availableWorkers * 0.8) surgeMultiplier = 1.25; // 25% surge
      if (activeBookings > availableWorkers * 1.5) surgeMultiplier = 1.5;  // 50% surge
    }

    const query = { role: 'worker', isBlocked: false };
    if (category && category !== 'all') query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const workers = await User.find(query).select('-password').lean();

    let result = workers.map((w) => ({
      ...w,
      distance:
        lat && lng
          ? haversineDistance(lat, lng, w.location?.lat || 0, w.location?.lng || 0)
          : 9999,
    }));

    if (lat && lng) {
      // Progressive radius expansion
      let filtered = result.filter((w) => w.distance <= radius);
      if (filtered.length === 0) filtered = result.filter((w) => w.distance <= radius * 2);
      if (filtered.length === 0) filtered = result;
      result = filtered;
    }

    const SUB_PRIORITY = { elite: 3, pro: 2, free: 1 };

    result.sort((a, b) => {
      // 1. Subscription priority
      const subA = SUB_PRIORITY[a.subscription] || 1;
      const subB = SUB_PRIORITY[b.subscription] || 1;
      if (subA !== subB) return subB - subA;

      // 2. Distance/Rating priority
      if (Math.abs(a.distance - b.distance) < 2) return b.rating - a.rating;
      return a.distance - b.distance;
    });

    return NextResponse.json({ workers: result, surgeMultiplier });
  } catch (error) {
    console.error('Get workers error:', error);
    return NextResponse.json({ error: 'Failed to fetch workers' }, { status: 500 });
  }
}
