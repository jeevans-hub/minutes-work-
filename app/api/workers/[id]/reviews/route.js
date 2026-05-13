import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;

    // Find completed bookings with ratings for this worker
    const reviews = await Booking.find({ 
      workerId: resolvedParams.id, 
      status: 'completed',
      rating: { $ne: null }
    })
    .populate('customerId', 'name avatar')
    .sort({ updatedAt: -1 })
    .select('rating review createdAt customerId');

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Fetch reviews error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
