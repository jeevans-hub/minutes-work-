import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    await connectDB();
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    const user = await User.findOne({ 
      email, 
      resetPasswordToken: code,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Code verified successfully' });
  } catch (error) {
    console.error('Verify Code error:', error);
    return NextResponse.json({ error: 'Failed to verify code' }, { status: 500 });
  }
}
