import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

const protectedRoutes = {
  customer: ['/dashboard', '/bookings', '/book', '/profile'],
  worker: ['/worker'],
  admin: ['/admin'],
};

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const cookieHeader = request.headers.get('cookie') || '';
  console.log(`[Middleware] Path: ${pathname}`);
  console.log(`[Middleware] Cookies: ${cookieHeader}`);
  
  const tokenCookie = request.cookies.get('token');
  const token = tokenCookie?.value;
  console.log(`[Middleware] Token: ${token ? `${token.substring(0, 10)}...` : 'NONE'}`);
  
  const user = token ? verifyToken(token) : null;
  console.log(`[Middleware] Auth Status: ${user ? `VERIFIED (${user.email})` : 'FAILED'}`);

  // Redirect logged-in users away from auth pages (including sub-routes)
  if ((pathname.startsWith('/login') || pathname.startsWith('/register')) && user) {
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
  matcher: [
    '/dashboard/:path*',
    '/bookings/:path*',
    '/book/:path*',
    '/profile/:path*',
    '/worker/:path*',
    '/admin/:path*',
    '/login',
    '/login/:path*',
    '/register',
    '/register/:path*',
  ],
};

export default proxy;
