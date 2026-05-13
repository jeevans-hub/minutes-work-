import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import Booking from '@/models/Booking';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const currentUser = getUserFromRequest(request);
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resolvedParams = await params;
    
    // Check if user is part of this booking
    const booking = await Booking.findById(resolvedParams.id);
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    
    if (booking.customerId.toString() !== currentUser.id && booking.workerId.toString() !== currentUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const messages = await Message.find({ bookingId: resolvedParams.id }).sort({ createdAt: 1 });
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Fetch messages error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    await connectDB();
    const currentUser = getUserFromRequest(request);
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resolvedParams = await params;
    const body = await request.json();
    const { text } = body;

    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
    }

    const booking = await Booking.findById(resolvedParams.id);
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    if (booking.customerId.toString() !== currentUser.id && booking.workerId.toString() !== currentUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const message = await Message.create({
      bookingId: resolvedParams.id,
      senderId: currentUser.id,
      text: text.trim()
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
