import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { getUserFromRequest } from '@/lib/auth';

const CATEGORY_ICONS = {
  Plumber: { icon: '🔧', color: 'from-blue-500 to-cyan-500' },
  Electrician: { icon: '⚡', color: 'from-yellow-500 to-amber-500' },
  Carpenter: { icon: '🪚', color: 'from-orange-500 to-red-500' },
  Cleaner: { icon: '🧹', color: 'from-green-500 to-emerald-500' },
  Painter: { icon: '🎨', color: 'from-pink-500 to-rose-500' },
  HVAC: { icon: '❄️', color: 'from-indigo-500 to-blue-500' },
  Mason: { icon: '🧱', color: 'from-stone-500 to-neutral-500' },
  Gardener: { icon: '🌿', color: 'from-lime-500 to-green-500' },
};

export async function GET(request) {
  try {
    await connectDB();
    const currentUser = getUserFromRequest(request);

    const recommendations = [];
    const addedCategories = new Set();

    const addRec = (category, reason) => {
      if (!addedCategories.has(category) && CATEGORY_ICONS[category]) {
        recommendations.push({
          category,
          reason,
          ...CATEGORY_ICONS[category]
        });
        addedCategories.add(category);
      }
    };

    // 1. Time based recommendation (Night emergencies)
    const hour = new Date().getHours();
    if (hour >= 20 || hour <= 6) {
      addRec('Electrician', 'Recommended for nighttime power emergencies.');
      addRec('Plumber', 'Plumbing emergencies often happen at night.');
    }

    // 2. Season based recommendation
    const month = new Date().getMonth(); // 0-11
    if (month >= 3 && month <= 7) {
      // April - August (Summer)
      addRec('HVAC', 'AC service recommended due to summer in your area.');
    } else if (month >= 1 && month <= 3) {
      // Feb - April (Spring cleaning)
      addRec('Cleaner', 'Spring cleaning season is here!');
    } else if (month >= 8 && month <= 10) {
      // Fall/Autumn
      addRec('Painter', 'Perfect weather for home painting and touch-ups.');
    }

    // 3. User history based recommendation
    if (currentUser && currentUser.role === 'customer') {
      const pastBookings = await Booking.find({ customerId: currentUser.id })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      if (pastBookings.length > 0) {
        // Count category frequencies
        const counts = {};
        let mostFrequent = pastBookings[0].category;
        let maxCount = 0;

        for (const b of pastBookings) {
          counts[b.category] = (counts[b.category] || 0) + 1;
          if (counts[b.category] > maxCount) {
            maxCount = counts[b.category];
            mostFrequent = b.category;
          }
        }

        // If they frequently book a category, maybe recommend related maintenance
        addRec(mostFrequent, `Based on your recent bookings, it might be time for maintenance.`);
      }
    }

    // Fallbacks if we don't have enough recommendations
    addRec('Cleaner', 'Our most popular daily service.');
    addRec('Plumber', 'Keep your pipes in top condition.');

    return NextResponse.json({ recommendations: recommendations.slice(0, 3) });
  } catch (error) {
    console.error('Recommendation Error:', error);
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}
