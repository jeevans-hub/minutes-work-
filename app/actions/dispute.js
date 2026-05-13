'use server';

import connectDB from '@/lib/mongodb';
import Dispute from '@/models/Dispute';
import Booking from '@/models/Booking';
import { revalidatePath } from 'next/cache';

export async function raiseDisputeAction({ bookingId, raisedBy, reason, details }) {
  try {
    await connectDB();

    if (!bookingId || !reason || !details) {
      return { success: false, error: 'Missing required fields' };
    }

    // Check if a dispute already exists
    const existingDispute = await Dispute.findOne({ bookingId, raisedBy });
    if (existingDispute) {
      return { success: false, error: 'You have already raised a dispute for this booking' };
    }

    const dispute = await Dispute.create({
      bookingId,
      raisedBy,
      reason,
      details,
    });

    revalidatePath(`/bookings/${bookingId}`);
    
    return { 
      success: true, 
      message: 'Dispute raised successfully. Our team will review it.' 
    };
  } catch (error) {
    console.error('Dispute Action Error:', error);
    return { success: false, error: 'Failed to raise dispute' };
  }
}
