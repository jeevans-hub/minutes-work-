import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { getUserFromRequest } from '@/lib/auth';
import { sendNotificationEmail } from '@/lib/mailer';

export async function GET(request) {
  try {
    await connectDB();
    const currentUser = getUserFromRequest(request);
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = {};
    if (currentUser.role === 'customer') query.customerId = currentUser.id;
    else if (currentUser.role === 'worker') query.workerId = currentUser.id;
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('customerId', 'name email phone avatar')
      .populate('workerId', 'name email phone avatar category rating')
      .sort({ createdAt: -1 });

    return NextResponse.json({ bookings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const currentUser = getUserFromRequest(request);
    if (!currentUser || currentUser.role !== 'customer') {
      return NextResponse.json({ error: 'Only customers can create bookings' }, { status: 403 });
    }

    const { 
      workerId, category, description, location, 
      paymentType, scheduledAt, amount, discountAmount, 
      walletUsed, couponCode 
    } = await request.json();

    if (!workerId || !category) {
      return NextResponse.json({ error: 'Worker and category are required' }, { status: 400 });
    }

    const worker = await User.findById(workerId);
    if (!worker || worker.role !== 'worker') {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
    }

    // Deduct wallet if used
    if (walletUsed > 0 && currentUser.walletBalance >= walletUsed) {
      const cust = await User.findById(currentUser.id);
      cust.walletBalance -= walletUsed;
      await cust.save();
    }

    const booking = new Booking({
      customerId: currentUser.id,
      workerId,
      category,
      description: description || '',
      location: location || {},
      paymentType: paymentType || 'cash',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      amount: amount || 0,
      discountAmount: discountAmount || 0,
      walletUsed: walletUsed || 0,
      couponCode: couponCode || null
    });

    await booking.save();

    // Notify worker
    await Notification.create({
      userId: workerId,
      message: `New job request for ${category} from a customer!`,
      type: 'new_booking',
      bookingId: booking._id,
    });

    // Notify customer
    await Notification.create({
      userId: currentUser.id,
      message: `Your booking for ${category} has been confirmed.`,
      type: 'new_booking',
      bookingId: booking._id,
    });

    const populated = await Booking.findById(booking._id)
      .populate('customerId', 'name email phone')
      .populate('workerId', 'name email phone category');

    // Send Emails
    await sendNotificationEmail(
      worker.email,
      'New Job Request - MintWork',
      `<p>You have a new job request for <b>${category}</b>.</p><p>Please check your dashboard.</p>`
    );

    await sendNotificationEmail(
      populated.customerId.email,
      'Booking Confirmed - MintWork',
      `<p>Your booking for <b>${category}</b> has been placed successfully.</p>`
    );

    return NextResponse.json({ booking: populated, message: 'Booking created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
