import { auth } from '@/lib/auth/auth-edge';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default auth((req) => {
  const { nextUrl, auth: session } = req as NextRequest & { auth: { user: { role?: string } } | null };
  const pathname = nextUrl.pathname;
  const userRole = session?.user?.role || '';

  // Super Admin only routes
  if (pathname.startsWith('/admin/audit-logs')) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', nextUrl));
    }
    if (userRole !== 'super_admin') {
      return NextResponse.redirect(new URL('/unauthorized', nextUrl));
    }
  }

  // Admin routes (admin & super_admin)
  if (pathname.startsWith('/admin')) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', nextUrl));
    }
    if (!['admin', 'super_admin'].includes(userRole)) {
      return NextResponse.redirect(new URL('/unauthorized', nextUrl));
    }
  }

  // Mentor routes (mentor, admin, & super_admin)
  if (pathname.startsWith('/mentor')) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', nextUrl));
    }
    if (!['mentor', 'admin', 'super_admin'].includes(userRole)) {
      return NextResponse.redirect(new URL('/unauthorized', nextUrl));
    }
  }

  // Protected student/user routes
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
