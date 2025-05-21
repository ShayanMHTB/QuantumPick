'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import authService from '@/services/auth/authService';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [verificationState, setVerificationState] = useState<{
    status: 'loading' | 'success' | 'error';
    message: string;
  }>({
    status: 'loading',
    message: 'Verifying your email...',
  });

  useEffect(() => {
    async function verifyEmail() {
      if (!token) {
        setVerificationState({
          status: 'error',
          message: 'Invalid verification link. No token provided.',
        });
        return;
      }

      try {
        const response = await authService.verifyEmail(token);

        if (response.success) {
          setVerificationState({
            status: 'success',
            message: 'Your email has been successfully verified!',
          });
        } else {
          setVerificationState({
            status: 'error',
            message:
              response.message ||
              'Failed to verify email. The link may be expired or invalid.',
          });
        }
      } catch (error: any) {
        setVerificationState({
          status: 'error',
          message:
            error.message ||
            'An error occurred while verifying your email. Please try again later.',
        });
        console.error('Verification error:', error);
      }
    }

    verifyEmail();
  }, [token]);

  const handleResendVerification = async () => {
    try {
      setVerificationState({
        status: 'loading',
        message: 'Requesting a new verification email...',
      });

      // Show a prompt for email address if needed
      const email = prompt(
        'Please enter your email address to receive a new verification link:',
      );

      if (!email) {
        setVerificationState({
          status: 'error',
          message: 'Email is required to resend verification.',
        });
        return;
      }

      const response = await authService.resendVerificationEmail(email);

      setVerificationState({
        status: 'success',
        message:
          'A new verification email has been sent. Please check your inbox.',
      });
    } catch (error: any) {
      setVerificationState({
        status: 'error',
        message:
          error.message ||
          'Failed to resend verification email. Please try again later.',
      });
    }
  };

  return (
    <div className="container flex flex-col items-center justify-center max-w-md py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Email Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {verificationState.status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
              <p className="text-center text-muted-foreground">
                {verificationState.message}
              </p>
            </div>
          )}

          {verificationState.status === 'success' && (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold text-center mb-2">
                Verification Successful
              </h3>
              <p className="text-center text-muted-foreground mb-6">
                {verificationState.message}
              </p>
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-700">
                  Your account is now verified! You can now access all features
                  of QuantumPick.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {verificationState.status === 'error' && (
            <div className="flex flex-col items-center justify-center py-8">
              <XCircle className="h-16 w-16 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-center mb-2">
                Verification Failed
              </h3>
              <p className="text-center text-muted-foreground mb-6">
                {verificationState.message}
              </p>
              <Alert variant="destructive">
                <AlertDescription>
                  We couldn't verify your email with the provided link. The link
                  might be expired or invalid.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          {verificationState.status === 'success' && (
            <Button
              className="w-full"
              onClick={() => router.push('/auth/login')}
            >
              Go to Login
            </Button>
          )}

          {verificationState.status === 'error' && (
            <div className="w-full space-y-2">
              <Button
                className="w-full"
                variant="default"
                onClick={handleResendVerification}
              >
                Resend Verification Email
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/auth/login')}
              >
                Back to Login
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
