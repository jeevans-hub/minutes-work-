import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

const protectedRoutes = {
  customer: ['/dashboard', '/bookings', '/book', '/profile'],
  worker: ['/worker'],
  admin: ['/admin'],
};

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const tokenCookie = request.cookies.get('token');
  const token = tokenCookie?.value;
  const user = token ? verifyToken(token) : null;

  // Redirect logged-in users away from auth pages
  if ((pathname === '/login' || pathname === '/register') && user) {
    const redirectMap = { customer: '/dashboard', worker: '/worker/dashboard', admin: '/admin/dashboard' };
    return NextResponse.redirect(new URL(redirectMap[user.role] || '/dashboard', request.url));
  }

  // Protect customer routes
  if (protectedRoutes.customer.some((r) => pathname.startsWith(r))) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url));
    if (user.role !== 'customer' && user.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Protect worker routes
  if (protectedRoutes.worker.some((r) => pathname.startsWith(r))) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url));
    if (user.role !== 'worker' && user.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Protect admin routes
  if (protectedRoutes.admin.some((r) => pathname.startsWith(r))) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url));
    if (user.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/bookings/:path*', '/book/:path*', '/profile/:path*', '/worker/:path*', '/admin/:path*', '/login', '/register'],
};

export default proxy;
