// Next.js middleware for route protection
// TODO: Implement authentication checks for protected routes

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { redirectWithLocale } from './utils/helper';

const SESSION_KEY = 'crm_session';

const intlMiddleware = createMiddleware({
  locales: ['en', 'fil', 'ja'],
  defaultLocale: 'en',
});

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

const authRoutes = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const session = request.cookies.get(SESSION_KEY)?.value;
  const pathname = request.nextUrl.pathname;

  const localeMatch = pathname.match(/^\/(en|fil|ja)(\/|$)/);
  const locale = localeMatch ? localeMatch[1] : 'en';
  const cleanPath = pathname.replace(/^\/(en|fil|ja)/, '') || '/';

  const isProtectedRoute = protectedRoutes.some((r) => cleanPath.startsWith(r));
  if (isProtectedRoute && !session) {
    return redirectWithLocale(request, locale, '/login');
  }

  const isAuthRoute = authRoutes.some((r) => cleanPath.startsWith(r));

  if (isAuthRoute) {
    if (session) return redirectWithLocale(request, locale, '/dashboard');
    return NextResponse.next();
  }

  if (cleanPath === '/') {
    return session
      ? redirectWithLocale(request, locale, '/dashboard')
      : redirectWithLocale(request, locale, '/login');
  }

  if (session) {
    try {
      const user = JSON.parse(session);
      if (
        cleanPath.startsWith('/agents') &&
        user.role.toLowerCase() !== 'admin'
      ) {
        return redirectWithLocale(request, locale, '/dashboard');
      }
    } catch (error) {
      console.error('Invalid session format', error);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
