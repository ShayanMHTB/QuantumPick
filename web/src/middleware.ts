import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

// Routes that require authentication
const protectedRoutes = ['/dashboard'];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Get the token from cookies
  const token = request.cookies.get('quantum_pick_auth_token')?.value;

  // Check if the current route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Check if the current route is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname === route);

  // If trying to access a protected route without a valid token
  if (isProtectedRoute) {
    if (!token) {
      // Redirect to login
      const url = new URL('/login', request.url);
      // Pass the intended destination as a query param
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    try {
      // Verify the token
      const isValid = await verifyToken(token);

      if (!isValid) {
        // Token is invalid, redirect to login
        const url = new URL('/login', request.url);
        url.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(url);
      }
    } catch (error) {
      // Token verification failed, redirect to login
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  // If already authenticated and trying to access auth routes
  if (isAuthRoute && token) {
    try {
      const isValid = await verifyToken(token);

      if (isValid) {
        // Token is valid, check if there's a callbackUrl to redirect to
        const callbackUrl = searchParams.get('callbackUrl');
        const redirectUrl = callbackUrl ? callbackUrl : '/dashboard';
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }
    } catch (error) {
      // Token verification failed, allow access to auth routes
    }
  }

  // Continue with the request
  return NextResponse.next();
}

// Configure which routes the middleware applies to
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/dashboard/lotteries/:path*',
    '/login',
    '/register',
  ],
};
