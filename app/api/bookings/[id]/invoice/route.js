import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { getUserFromRequest } from '@/lib/auth';
import { sendNotificationEmail } from '@/lib/mailer';

export async function POST(request, { params }) {
  try {
    await connectDB();
    const currentUser = getUserFromRequest(request);
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resolvedParams = await params;
    const booking = await Booking.findById(resolvedParams.id)
      .populate('workerId', 'name category')
      .populate('customerId', 'name email');

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    // Only customer or worker or admin can request this
    if (
      booking.customerId._id.toString() !== currentUser.id &&
      booking.workerId._id.toString() !== currentUser.id &&
      currentUser.role !== 'admin'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const htmlReceipt = `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
        <h2 style="color: #4f46e5; text-align: center;">MintWork Invoice</h2>
        <p style="text-align: center; color: #64748b;">Receipt for Service #${booking._id}</p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <div>
            <strong>Billed To:</strong><br/>
            ${booking.customerId.name}<br/>
            ${booking.customerId.email}
          </div>
          <div style="text-align: right;">
            <strong>Service Provider:</strong><br/>
            ${booking.workerId.name}<br/>
            ${booking.workerId.category}
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f8fafc;">
              <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0;">Description</th>
              <th style="padding: 12px; text-align: right; border-bottom: 1px solid #e2e8f0;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${booking.category} Base Service Fee</td>
              <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e2e8f0;">$${(booking.amount + booking.discountAmount + booking.walletUsed).toFixed(2)}</td>
            </tr>
            ${booking.discountAmount > 0 ? `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #10b981;">Promo Discount (${booking.couponCode})</td>
              <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e2e8f0; color: #10b981;">-$${booking.discountAmount.toFixed(2)}</td>
            </tr>` : ''}
            ${booking.walletUsed > 0 ? `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #6366f1;">Wallet Applied</td>
              <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e2e8f0; color: #6366f1;">-$${booking.walletUsed.toFixed(2)}</td>
            </tr>` : ''}
            <tr style="font-weight: bold;">
              <td style="padding: 12px;">Total Paid (${booking.paymentType === 'online' ? 'Online' : 'Cash'})</td>
              <td style="padding: 12px; text-align: right;">$${booking.amount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        <p style="text-align: center; color: #64748b; font-size: 12px; margin-top: 40px;">
          Thank you for using MintWork!<br/>
          If you have any questions, reply to this email.
        </p>
      </div>
    `;

    // Send to whoever requested it
    await sendNotificationEmail(currentUser.email, `Invoice for Booking #${booking._id}`, htmlReceipt);

    return NextResponse.json({ message: 'Invoice sent successfully' });
  } catch (error) {
    console.error('Invoice error:', error);
    return NextResponse.json({ error: 'Failed to send invoice' }, { status: 500 });
  }
}
