import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const workerId = resolvedParams.id;
    
    const url = new URL(request.url);
    const dateStr = url.searchParams.get('date'); // YYYY-MM-DD

    if (!dateStr) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    // Start and end of the requested day in UTC or local timezone
    // Here we'll treat the date as simple string matching or parse it
    const startDate = new Date(dateStr);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(dateStr);
    endDate.setHours(23, 59, 59, 999);

    // Find all active bookings for this worker on this date
    const activeBookings = await Booking.find({
      workerId,
      scheduledAt: { $gte: startDate, $lte: endDate },
      status: { $nin: ['cancelled', 'rejected'] }
    }).select('scheduledAt');

    // Extract booked hours
    const bookedHours = activeBookings.map(b => new Date(b.scheduledAt).getHours());

    // Generate slots from 9 AM to 5 PM
    const allSlots = [];
    for (let hour = 9; hour <= 17; hour++) {
      allSlots.push({
        hour,
        timeString: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`,
        isAvailable: !bookedHours.includes(hour)
      });
    }

    return NextResponse.json({ slots: allSlots });
  } catch (error) {
    console.error('Fetch slots error:', error);
    return NextResponse.json({ error: 'Failed to fetch time slots' }, { status: 500 });
  }
}
