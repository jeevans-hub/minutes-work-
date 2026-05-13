import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Dispute from '@/models/Dispute';
import Booking from '@/models/Booking';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { bookingId, reason, details } = await request.json();

    if (!bookingId || !reason || !details) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    // Check if a dispute already exists for this booking by this user
    const existingDispute = await Dispute.findOne({ bookingId, raisedBy: user.id });
    if (existingDispute) {
      return NextResponse.json({ error: 'You have already raised a dispute for this booking' }, { status: 400 });
    }

    const dispute = await Dispute.create({
      bookingId,
      raisedBy: user.id,
      reason,
      details,
    });

    return NextResponse.json({ dispute, message: 'Dispute raised successfully. Our team will review it.' });
  } catch (error) {
    console.error('Raise dispute error:', error);
    return NextResponse.json({ error: 'Failed to raise dispute' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await connectDB();
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const disputes = await Dispute.find({ raisedBy: user.id })
      .populate('bookingId', 'category status')
      .sort({ createdAt: -1 });

    return NextResponse.json({ disputes });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch disputes' }, { status: 500 });
  }
}
