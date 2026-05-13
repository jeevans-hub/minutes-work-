import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { getUserFromRequest } from '@/lib/auth';
import { sendNotificationEmail } from '@/lib/mailer';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const currentUser = getUserFromRequest(request);
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resolvedParams = await params;

    const booking = await Booking.findById(resolvedParams.id)
      .populate('customerId', 'name email phone avatar address location')
      .populate('workerId', 'name email phone avatar category rating location');

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    return NextResponse.json({ booking });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const currentUser = getUserFromRequest(request);
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resolvedParams = await params;
    const body = await request.json();
    const booking = await Booking.findById(resolvedParams.id);
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    const { status, rating, review, paymentStatus } = body;

    // Worker can update status (accept/reject/inProgress/completed)
    if (status) {
      const workerStatuses = ['accepted', 'rejected', 'inProgress', 'completed'];
      const customerStatuses = ['cancelled'];

      if (workerStatuses.includes(status) && currentUser.role !== 'worker' && currentUser.role !== 'admin') {
        return NextResponse.json({ error: 'Only workers can update job status' }, { status: 403 });
      }
      if (customerStatuses.includes(status) && booking.customerId.toString() !== currentUser.id && currentUser.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      booking.status = status;

      // Send notifications
      let notifUserId, notifMsg, notifType;
      if (status === 'accepted') {
        notifUserId = booking.customerId;
        notifMsg = 'Your booking has been accepted by the worker!';
        notifType = 'booking_accepted';
      } else if (status === 'rejected' || status === 'cancelled') {
        notifUserId = status === 'rejected' ? booking.customerId : booking.workerId;
        notifMsg = status === 'rejected' ? 'Your booking was rejected.' : 'The customer has cancelled the booking.';
        notifType = 'status_update';

        // REFUND LOGIC: If customer used wallet, refund it
        if (booking.walletUsed > 0) {
          const customer = await User.findById(booking.customerId);
          if (customer) {
            customer.walletBalance += booking.walletUsed;
            await customer.save();
          }
        }
      } else if (status === 'onTheWay') {
        notifUserId = booking.customerId;
        notifMsg = 'Worker is on the way to your location!';
        notifType = 'status_update';
      } else if (status === 'arrived') {
        notifUserId = booking.customerId;
        notifMsg = 'Worker has arrived at your location!';
        notifType = 'status_update';
      } else if (status === 'completed') {
        notifUserId = booking.customerId;
        notifMsg = 'Your job has been completed! Please rate the worker.';
        notifType = 'booking_completed';

        // ESCROW RELEASE LOGIC: Transfer money to worker
        if (booking.paymentStatus !== 'paid_to_worker') {
          const worker = await User.findById(booking.workerId);
          if (worker) {
            const platformCommission = worker.commissionRate || 0.2;
            const netAmount = booking.amount * (1 - platformCommission);
            worker.walletBalance += netAmount;
            await worker.save();
            booking.paymentStatus = 'paid'; // Mark as paid to worker internally
          }
        }

        // Update worker rating if rated
        if (rating) {
          const worker = await User.findById(booking.workerId);
          if (worker) {
            const newCount = worker.ratingCount + 1;
            const newRating = (worker.rating * worker.ratingCount + rating) / newCount;
            worker.rating = parseFloat(newRating.toFixed(2));
            worker.ratingCount = newCount;
            await worker.save();
          }
          booking.rating = rating;
          if (review) booking.review = review;
        }
      }
 else if (status === 'inProgress') {
        notifUserId = booking.customerId;
        notifMsg = 'Your job is now in progress.';
        notifType = 'status_update';
      }

      if (notifUserId) {
        const newNotif = await Notification.create({
          userId: notifUserId,
          message: notifMsg,
          type: notifType,
          bookingId: booking._id,
        });
        
        // Emit real-time notification via Socket.io
        if (global.io) {
          global.io.to(notifUserId.toString()).emit('new_notification', newNotif);
        }
        
        // Dispatch Email
        const customer = await User.findById(booking.customerId);
        if (customer && customer.email) {
          let emailSubject = 'Booking Update - MintWork';
          let emailHtml = `<p>${notifMsg}</p>`;
          
          if (status === 'accepted') emailSubject = 'Booking Accepted! - MintWork';
          if (status === 'completed') emailSubject = 'Job Completed! - MintWork';
          
          await sendNotificationEmail(customer.email, emailSubject, emailHtml);
        }
      }
    }

    // Customer can add rating after completion
    if (rating && booking.status === 'completed' && currentUser.role === 'customer') {
      booking.rating = rating;
      if (review) booking.review = review;

      const worker = await User.findById(booking.workerId);
      if (worker) {
        const newCount = worker.ratingCount + 1;
        const newRating = (worker.rating * worker.ratingCount + rating) / newCount;
        worker.rating = parseFloat(newRating.toFixed(2));
        worker.ratingCount = newCount;
        await worker.save();
      }
    }

    if (paymentStatus && paymentStatus !== booking.paymentStatus) {
      booking.paymentStatus = paymentStatus;
      if (paymentStatus === 'paid') {
        const notif = await Notification.create({
          userId: booking.customerId,
          message: `Payment successful for your ${booking.category} booking!`,
          type: 'status_update',
          bookingId: booking._id,
        });

        if (global.io) {
          global.io.to(booking.customerId.toString()).emit('new_notification', notif);
        }

        const customer = await User.findById(booking.customerId);
        if (customer && customer.email) {
          await sendNotificationEmail(
            customer.email,
            'Payment Successful - MintWork',
            `<p>Your payment for booking <b>${booking.category}</b> was successful!</p>`
          );
        }
      }
    }

    await booking.save();

    const updated = await Booking.findById(booking._id)
      .populate('customerId', 'name email phone avatar address location')
      .populate('workerId', 'name email phone avatar category rating location');

    return NextResponse.json({ booking: updated, message: 'Booking updated' });
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
