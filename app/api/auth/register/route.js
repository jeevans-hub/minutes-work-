import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/auth';

export async function POST(request) {
  // Separate DB connection from request logic so errors are distinct
  try {
    await connectDB();
  } catch (dbError) {
    console.error('Register DB error:', dbError.message);
    return NextResponse.json(
      { error: 'Service temporarily unavailable. Please try again shortly.' },
      { status: 503 }
    );
  }

  try {
    const { name, email, password, role, phone, category, skills, experience, referralCode } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const userData = {
      name,
      email,
      password,
      role: role || 'customer',
      phone: phone || '',
      walletBalance: 0,
    };

    // Handle Referral
    if (referralCode) {
      const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
      if (referrer) {
        userData.referredBy = referrer._id;
        userData.walletBalance = 50; // New user gets 50 credits

        referrer.walletBalance += 100; // Referrer gets 100 credits
        referrer.referralCount += 1;
        await referrer.save();
      }
    }

    if (role === 'worker') {
      userData.category = category || '';
      userData.skills = skills || [];
      userData.experience = experience || 0;
    }

    const user = new User(userData);
    await user.save();

    const token = signToken({ id: user._id.toString(), role: user.role, name: user.name, email: user.email });

    const response = NextResponse.json({
      success: true,
      user: user.toSafeObject(),
      message: 'Registration successful',
    }, { status: 201 });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({
      error: 'Registration failed',
      details: error.message,
    }, { status: 500 });
  }
}
