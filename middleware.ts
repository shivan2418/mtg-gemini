import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/server/auth';

export async function middleware(request: NextRequest) {
  // Get the session
  const session = await auth();

  // Define protected routes (routes that require authentication)
  const protectedRoutes = ['/quiz', '/cards'];

  // Define public routes (routes that don't require authentication)
  const publicRoutes = ['/auth/signin', '/api/auth'];

  const { pathname } = request.nextUrl;

  // Allow access to public routes and API routes
  if (
    publicRoutes.some((route) => pathname.startsWith(route)) ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/'),
  );

  // If it's a protected route and user is not authenticated, redirect to signin
  if (isProtectedRoute && !session?.user) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If user is authenticated and trying to access signin page, redirect to home
  if (session?.user && pathname === '/auth/signin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
