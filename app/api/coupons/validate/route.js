import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();
    const currentUser = getUserFromRequest(request);
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { code } = body;

    if (!code) return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });

    if (!coupon) return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 });
    if (!coupon.isActive) return NextResponse.json({ error: 'Coupon is no longer active' }, { status: 400 });
    if (new Date() > new Date(coupon.expiryDate)) return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 });

    // Check if user already used it
    if (coupon.usedBy.includes(currentUser.id)) {
      return NextResponse.json({ error: 'You have already used this coupon' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      discountPercentage: coupon.discountPercentage,
      maxDiscount: coupon.maxDiscount
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
  }
}
