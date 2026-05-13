import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Dispute from '@/models/Dispute';
import Booking from '@/models/Booking';
import Notification from '@/models/Notification';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { status, resolution } = await request.json();

    const dispute = await Dispute.findById(id);
    if (!dispute) return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });

    dispute.status = status;
    dispute.resolution = resolution;
    dispute.resolvedBy = user.id;
    await dispute.save();

    // Notify the user who raised the dispute
    const notifMsg = `Your dispute for booking has been ${status}. Resolution: ${resolution}`;
    await Notification.create({
      userId: dispute.raisedBy,
      message: notifMsg,
      type: 'status_update',
      bookingId: dispute.bookingId,
    });

    // Emit real-time notification if socket is available
    if (global.io) {
      global.io.to(dispute.raisedBy.toString()).emit('new_notification', {
        message: notifMsg,
        type: 'status_update',
        bookingId: dispute.bookingId,
      });
    }

    return NextResponse.json({ dispute, message: 'Dispute updated successfully' });
  } catch (error) {
    console.error('Update dispute error:', error);
    return NextResponse.json({ error: 'Failed to update dispute' }, { status: 500 });
  }
}
