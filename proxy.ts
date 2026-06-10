import { auth } from '@/lib/auth/auth-edge';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default auth((req) => {
  const { nextUrl, auth: session } = req as NextRequest & { auth: { user: { role?: string } } | null };
  const pathname = nextUrl.pathname;

  // Admin routes
  if (pathname.startsWith('/admin')) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', nextUrl));
    }
    if (!['admin', 'super_admin'].includes(session.user.role || '')) {
      return NextResponse.redirect(new URL('/unauthorized', nextUrl));
    }
  }

  // Student/mentor protected routes
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/my-internships') ||
    pathname.startsWith('/assignments') ||
    pathname.startsWith('/certificates') ||
    pathname.startsWith('/payments') ||
    pathname.startsWith('/profile')
  ) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', nextUrl));
    }
  }

  // Mentor routes
  if (pathname.startsWith('/mentor')) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', nextUrl));
    }
    if (!['mentor', 'admin', 'super_admin'].includes(session.user.role || '')) {
      return NextResponse.redirect(new URL('/unauthorized', nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/my-internships/:path*',
    '/assignments/:path*',
    '/certificates/:path*',
    '/payments/:path*',
    '/profile/:path*',
    '/mentor/:path*',
  ],
};
