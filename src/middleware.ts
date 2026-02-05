// Next.js middleware for route protection
// TODO: Implement authentication checks for protected routes

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Placeholder - just pass through for now
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
