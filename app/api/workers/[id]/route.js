import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const worker = await User.findById(resolvedParams.id).select('-password').lean();
    if (!worker) return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
    return NextResponse.json({ worker });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch worker' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const currentUser = getUserFromRequest(request);
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resolvedParams = await params;

    if (currentUser.id !== resolvedParams.id && currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const allowedFields = ['name', 'phone', 'address', 'location', 'skills', 'category', 'experience', 'bio', 'isAvailable', 'avatar'];
    const updates = {};
    allowedFields.forEach((f) => { if (body[f] !== undefined) updates[f] = body[f]; });

    const user = await User.findByIdAndUpdate(resolvedParams.id, updates, { new: true }).select('-password');
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
