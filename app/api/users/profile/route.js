import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    await connectDB();
    const currentUser = getUserFromRequest(request);
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await User.findById(currentUser.id).select('-password');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const currentUser = getUserFromRequest(request);
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const allowedFields = ['name', 'phone', 'address', 'location', 'skills', 'category', 'experience', 'bio', 'isAvailable', 'avatar'];
    const updates = {};
    allowedFields.forEach((f) => { if (body[f] !== undefined) updates[f] = body[f]; });

    const user = await User.findByIdAndUpdate(currentUser.id, updates, { new: true }).select('-password');
    return NextResponse.json({ user, message: 'Profile updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
