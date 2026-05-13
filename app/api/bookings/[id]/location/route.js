import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const currentUser = getUserFromRequest(request);
    if (!currentUser || currentUser.role !== 'worker') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const body = await request.json();
    const { lat, lng } = body;

    if (lat === undefined || lng === undefined) {
      return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
    }

    const booking = await Booking.findById(resolvedParams.id);
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    // Ensure only the assigned worker can update the location
    if (booking.workerId.toString() !== currentUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    booking.workerLocation = { lat, lng };
    await booking.save();

    return NextResponse.json({ message: 'Location updated successfully' });
  } catch (error) {
    console.error('Update location error:', error);
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
  }
}
