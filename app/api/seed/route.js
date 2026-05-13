import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Category from '@/models/Category';

const DEFAULT_CATEGORIES = [
  { name: 'Plumber', icon: '🔧', color: '#3B82F6', description: 'Pipe repairs, installations & more' },
  { name: 'Electrician', icon: '⚡', color: '#F59E0B', description: 'Wiring, fixtures & electrical work' },
  { name: 'Carpenter', icon: '🪚', color: '#F97316', description: 'Furniture, repairs & woodwork' },
  { name: 'Cleaner', icon: '🧹', color: '#10B981', description: 'Deep cleaning & housekeeping' },
  { name: 'Painter', icon: '🎨', color: '#EC4899', description: 'Interior & exterior painting' },
  { name: 'HVAC', icon: '❄️', color: '#6366F1', description: 'AC repair, installation & service' },
  { name: 'Mason', icon: '🧱', color: '#78716C', description: 'Brickwork, tiling & plastering' },
  { name: 'Gardener', icon: '🌿', color: '#84CC16', description: 'Lawn care & landscaping' },
];

export async function GET() {
  try {
    await connectDB();

    // Create admin
    const existingAdmin = await User.findOne({ email: 'admin@mintwork.com' });
    if (!existingAdmin) {
      await User.create({
        name: 'Admin',
        email: 'admin@mintwork.com',
        password: 'admin123',
        role: 'admin',
        phone: '+91-9999999999',
      });
    }

    // Seed categories
    for (const cat of DEFAULT_CATEGORIES) {
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) {
        await Category.create(cat);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Seeded: admin@mintwork.com / admin123 + 8 categories',
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
