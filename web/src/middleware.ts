import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';
import jwt from 'jsonwebtoken';

// Routes that require authentication
const protectedRoutes = ['/dashboard'];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/auth/login', '/auth/register'];

// Routes that are exempt from email verification
const emailVerificationExemptRoutes = [
  '/dashboard/profile', // Allow users to access profile to see verification status
  '/auth/verify', // Allow access to verification page
];

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

  // Check if route is exempt from email verification
  const isExemptFromEmailVerification = emailVerificationExemptRoutes.some(
    (route) => pathname.startsWith(route),
  );

  // If trying to access a protected route without a valid token
  if (isProtectedRoute) {
    if (!token) {
      // Redirect to login
      const url = new URL('/auth/login', request.url);
      // Pass the intended destination as a query param
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    try {
      // Verify the token
      const isValid = await verifyToken(token);

      if (!isValid) {
        // Token is invalid, redirect to login
        const url = new URL('/auth/login', request.url);
        url.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(url);
      }

      // Check email verification status (only for protected routes that require verification)
      if (!isExemptFromEmailVerification) {
        try {
          // Decode the token to get user information
          const decoded = jwt.decode(token);

          // If the user has an email (traditional auth) and is not verified
          if (
            decoded &&
            typeof decoded === 'object' &&
            'email' in decoded &&
            decoded.email &&
            ('isEmailVerified' in decoded ? !decoded.isEmailVerified : true)
          ) {
            // Redirect to profile page with verification needed flag
            const url = new URL('/dashboard/profile', request.url);
            url.searchParams.set('verificationNeeded', 'true');
            return NextResponse.redirect(url);
          }
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
    } catch (error) {
      // Token verification failed, redirect to login
      const url = new URL('/auth/login', request.url);
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

        // Check if user needs email verification
        const decoded = jwt.decode(token);
        if (
          decoded &&
          typeof decoded === 'object' &&
          'email' in decoded &&
          decoded.email &&
          ('isEmailVerified' in decoded ? !decoded.isEmailVerified : true)
        ) {
          // If email not verified, redirect to profile with verification banner
          return NextResponse.redirect(
            new URL('/dashboard/profile?verificationNeeded=true', request.url),
          );
        }

        // Otherwise redirect to dashboard or callback
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
    '/auth/login',
    '/auth/register',
    '/auth/verify',
  ],
};
