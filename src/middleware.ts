// Next.js middleware for route protection
// TODO: Implement authentication checks for protected routes

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
const SESSION_KEY = 'crm_session';
// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/customers',
  '/products',
  '/orders',
  '/agents',
  '/tasks',
  '/analytics',
  '/account',
];
// Routes accessible only when NOT authenticated
const authRoutes = ['/login'];
export function middleware(request: NextRequest) {
  const session = request.cookies.get(SESSION_KEY)?.value;
  const pathname = request.nextUrl.pathname;
  // Check if trying to access protected route without session
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  // Check if trying to access auth routes with active session
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|products).*)',
  ],
};
