import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';

const COMMISSIONS = {
  free: 0.2,
  pro: 0.15,
  elite: 0.1,
};

export async function POST(request) {
  try {
    await connectDB();
    const currentUser = getUserFromRequest(request);
    if (!currentUser || currentUser.role !== 'worker') {
      return NextResponse.json({ error: 'Worker only' }, { status: 401 });
    }

    const { planId } = await request.json();
    if (!['free', 'pro', 'elite'].includes(planId)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Update user subscription
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 1);

    const user = await User.findByIdAndUpdate(
      currentUser.id,
      {
        subscription: planId,
        subExpires: expiry,
        commissionRate: COMMISSIONS[planId],
      },
      { new: true }
    ).select('-password');

    return NextResponse.json({ 
      user, 
      message: `Successfully upgraded to ${planId.toUpperCase()}!` 
    });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Failed to process subscription' }, { status: 500 });
  }
}
