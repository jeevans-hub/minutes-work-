import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    await connectDB();
    const { email, code, password } = await request.json();

    if (!email || !code || !password) {
      return NextResponse.json({ error: 'Email, code and new password are required' }, { status: 400 });
    }

    const user = await User.findOne({
      email,
      resetPasswordToken: code,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired reset code' }, { status: 400 });
    }

    // Update password
    user.password = password; // pre-save hook will hash it
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return NextResponse.json({
      message: 'Password successfully reset! You can now log in.'
    });
  } catch (error) {
    console.error('Reset Password error:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
