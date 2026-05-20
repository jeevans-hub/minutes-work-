import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  console.log('[Auth] /api/auth/me requested');
  const user = getUserFromRequest(request);
  
  if (!user) {
    console.log('[Auth] /api/auth/me - Unauthorized');
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  console.log('[Auth] /api/auth/me - Success for user:', user.email);
  return NextResponse.json({ user });
}
