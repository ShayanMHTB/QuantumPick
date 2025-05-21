'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { store, useAppDispatch, useAppSelector } from '@/store';
import {
  checkEmailVerification,
  getCurrentUser,
} from '@/store/slices/authSlice';
import { isProtectedRoute, getAuthToken } from '@/lib/auth';
import { toast } from 'sonner';

// Props for the internal auth wrapper
interface AuthWrapperProps {
  children: ReactNode;
}

// Internal component to handle auth logic
const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [verificationChecked, setVerificationChecked] = useState(false);

  // Get auth state from Redux
  const { isAuthenticated, isLoading, user, isEmailVerified } = useAppSelector(
    (state) => state.auth,
  );

  // Check authentication on mount and when pathname changes
  useEffect(() => {
    // Only try to get current user if we have a token but no user data
    const token = getAuthToken();
    if (token && !user && !isLoading) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, user, isLoading]);

  // Check email verification status when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.email && !verificationChecked && !isLoading) {
      dispatch(checkEmailVerification())
        .unwrap()
        .then((verified) => {
          setVerificationChecked(true);
          // If email is not verified and user is trying to access a protected route
          if (
            !verified &&
            isProtectedRoute(pathname || '') &&
            !pathname?.includes('/dashboard/profile') &&
            !pathname?.includes('/auth/verify')
          ) {
            toast.warning('Please verify your email to access all features.');
            router.push('/dashboard/profile?verificationNeeded=true');
          }
        })
        .catch((err) => {
          console.error('Failed to check email verification status:', err);
          setVerificationChecked(true);
        });
    }
  }, [
    isAuthenticated,
    user,
    isLoading,
    pathname,
    dispatch,
    router,
    verificationChecked,
  ]);

  // Handle route protection and redirects
  useEffect(() => {
    // Skip during initial loading
    if (isLoading) return;

    const currentRouteIsProtected = isProtectedRoute(pathname || '');
    const callbackUrl = searchParams.get('callbackUrl');
    const verificationNeeded =
      searchParams.get('verificationNeeded') === 'true';

    // For dashboard routes, ensure email is verified if needed
    if (
      currentRouteIsProtected &&
      isAuthenticated &&
      user?.email &&
      !user.isEmailVerified
    ) {
      // Only redirect if not already on profile or verification page and not handling verification
      if (
        !pathname?.includes('/dashboard/profile') &&
        !pathname?.includes('/auth/verify') &&
        !verificationNeeded
      ) {
        router.push('/dashboard/profile?verificationNeeded=true');
        return;
      }
    }

    // Redirect to login if trying to access protected route while not authenticated
    if (currentRouteIsProtected && !isAuthenticated) {
      router.push(
        `/auth/login?callbackUrl=${encodeURIComponent(
          pathname || '/dashboard',
        )}`,
      );
      return;
    }

    // Redirect to dashboard or callback if already authenticated and trying to access auth pages
    if (
      isAuthenticated &&
      (pathname === '/auth/login' || pathname === '/auth/register')
    ) {
      // If email verification is required but not verified, go to profile
      if (user?.email && !user.isEmailVerified) {
        router.push('/dashboard/profile?verificationNeeded=true');
      } else {
        router.push(callbackUrl || '/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, pathname, router, searchParams, user]);

  return <>{children}</>;
};

// Props for the main AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

// Main AuthProvider component that wraps the app
const AuthProvider = ({ children }: AuthProviderProps) => {
  return (
    <ReduxProvider store={store}>
      <AuthWrapper>{children}</AuthWrapper>
    </ReduxProvider>
  );
};

export default AuthProvider;
