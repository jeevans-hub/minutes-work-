'use server';

import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Notification from '@/models/Notification';
import { revalidatePath } from 'next/cache';

export async function updateBookingStatus(bookingId, status, userId) {
  try {
    await connectDB();
    
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error('Booking not found');

    booking.status = status;
    await booking.save();

    // Notify user
    const message = `Your booking status is now: ${status}`;
    await Notification.create({
      userId: booking.customerId,
      message,
      type: 'status_update',
      bookingId: booking._id,
    });

    // Revalidate paths for instant UI update
    revalidatePath(`/bookings/${bookingId}`);
    revalidatePath('/dashboard');
    revalidatePath('/worker/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Action Error:', error);
    return { success: false, error: error.message };
  }
}
