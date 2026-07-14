import type { NextAuthConfig } from 'next-auth';

// Deliberately excludes providers and anything touching Prisma/bcrypt.
// This file gets imported by middleware.ts, which runs on the Edge
// runtime - a restricted environment that can't run Node-only code like
// database drivers or bcrypt's native hashing. Keeping this config
// "empty" of that logic is what lets middleware check auth state
// (via the JWT) without ever bundling Prisma into the Edge bundle.
export const authConfig: NextAuthConfig = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/auth/login',
  },

  providers: [],

  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = (user as { role?: string }).role;
        token.isActive = (user as { isActive?: boolean }).isActive ?? true;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.isActive = (token.isActive as boolean) ?? true;
      }
      return session;
    },

    async authorized({ request, auth }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const isSuspended = isLoggedIn && auth!.user!.isActive === false;
      const isAuthPage = pathname === '/auth/login' || pathname === '/auth/register';
      const isProtectedRoute =
        pathname.startsWith('/admin') ||
        pathname.startsWith('/vendor') ||
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/profile') ||
        pathname.startsWith('/settings') ||
        pathname.startsWith('/bookings') ||
        pathname.startsWith('/payments');

      if (isProtectedRoute && !isLoggedIn) return false;

      if (isProtectedRoute && isSuspended) {
        return Response.redirect(new URL('/auth/login?suspended=true', request.nextUrl.origin));
      }

      if (isAuthPage && isLoggedIn) {
        if (isSuspended) {
          return Response.redirect(new URL('/auth/login?suspended=true', request.nextUrl.origin));
        }
        const role = auth!.user!.role;
        if (role === 'ADMIN') {
          return Response.redirect(new URL('/admin', request.nextUrl.origin));
        }
        if (role === 'VENDOR') {
          return Response.redirect(new URL('/vendor', request.nextUrl.origin));
        }
        return Response.redirect(new URL('/dashboard', request.nextUrl.origin));
      }

      const role = auth?.user?.role;
      if (pathname.startsWith('/admin') && role !== 'ADMIN') {
        return Response.redirect(new URL(role === 'VENDOR' ? '/vendor' : '/dashboard', request.nextUrl.origin));
      }
      if (pathname.startsWith('/vendor') && role !== 'VENDOR' && role !== 'ADMIN') {
        return Response.redirect(new URL('/dashboard', request.nextUrl.origin));
      }
      if (pathname.startsWith('/dashboard') && (role === 'ADMIN' || role === 'VENDOR')) {
        return Response.redirect(new URL(role === 'ADMIN' ? '/admin' : '/vendor', request.nextUrl.origin));
      }

      return true;
    },
  },
};
