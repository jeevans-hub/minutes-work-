import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { sendNotificationEmail } from '@/lib/mailer';

export async function POST(request) {
  try {
    await connectDB();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists for security, but say check email
      return NextResponse.json({ message: 'If an account exists with this email, a reset code has been sent.' });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 600000); // 10 minutes from now (shorter for OTP)

    user.resetPasswordToken = code;
    user.resetPasswordExpires = expires;
    await user.save();

    // Send email
    await sendNotificationEmail(
      email,
      'Your Password Reset Code — MintWork',
      `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4F46E5; text-align: center;">MintWork</h2>
        <p>Hello,</p>
        <p>You requested a password reset for your MintWork account. Use the following code to reset your password. This code will expire in 10 minutes.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937; margin: 20px 0;">
          ${code}
        </div>
        <p>If you did not request this, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #6b7280; text-align: center;">MintWork — Professional Services Marketplace</p>
      </div>
      `
    );

    return NextResponse.json({ 
      message: 'Reset code sent! Please check your email (and console/logs in dev).' 
    });
  } catch (error) {
    console.error('Forgot Password error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
