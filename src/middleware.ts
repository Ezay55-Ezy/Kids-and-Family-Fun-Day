import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from '@/auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin');
  const isVendorRoute = pathname.startsWith('/vendor');
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isProtectedRoute =
    isAdminRoute ||
    isVendorRoute ||
    isDashboardRoute ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/bookings') ||
    pathname.startsWith('/payments');

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  if (!req.auth) {
    const loginUrl = new URL('/auth/login', req.nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*', '/vendor/:path*', '/admin/:path*', '/profile/:path*', '/settings/:path*', '/bookings/:path*', '/payments/:path*'],
};
