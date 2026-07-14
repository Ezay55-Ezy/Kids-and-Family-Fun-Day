import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from '@/auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*', '/vendor/:path*', '/admin/:path*', '/profile/:path*', '/settings/:path*', '/bookings/:path*', '/payments/:path*'],
};
