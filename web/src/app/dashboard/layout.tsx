'use client';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAppDispatch, useAppSelector } from '@/store';
import { getCurrentUser } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import EmailVerificationBanner from '@/components/auth/EmailVerificationBanner';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, isLoading, user } = useAppSelector(
    (state) => state.auth,
  );
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Check if token exists but user state is missing (could happen on page refresh)
  useEffect(() => {
    const token = localStorage.getItem('quantum_pick_auth_token');

    if (token && !isAuthenticated && !isLoading) {
      // Try to get the current user with the token
      dispatch(getCurrentUser());
    } else if (!token && !isLoading) {
      // No token, redirect to login
      router.push('/auth/login?callbackUrl=/dashboard');
    }
  }, [dispatch, isAuthenticated, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // If not authenticated and not loading, show nothing (will redirect in useEffect)
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="ml-2">Authenticating...</p>
      </div>
    );
  }

  // If authenticated, render the dashboard
  return (
    <SidebarProvider>
      <DashboardSidebar isOpen={true} user={user} />
      <main className="flex-1 py-3 px-6">
        <DashboardHeader />

        {/* Email verification banner - only show if user has email and is not verified */}
        {user?.email && user.isEmailVerified === false && (
          <EmailVerificationBanner email={user.email} />
        )}

        {children}
      </main>
    </SidebarProvider>
  );
}
