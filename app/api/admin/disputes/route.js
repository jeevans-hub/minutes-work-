import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Dispute from '@/models/Dispute';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    await connectDB();
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const disputes = await Dispute.find()
      .populate('bookingId', 'category status customerId workerId')
      .populate('raisedBy', 'name role')
      .sort({ createdAt: -1 });

    return NextResponse.json({ disputes });
  } catch (error) {
    console.error('Admin disputes fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch disputes' }, { status: 500 });
  }
}
