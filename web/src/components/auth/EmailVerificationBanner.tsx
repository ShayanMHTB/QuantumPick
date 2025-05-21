// src/components/auth/EmailVerificationBanner.tsx
import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import authService from '@/services/auth/authService';
import { toast } from 'sonner';
import useAuth from '@/hooks/useAuth';

interface EmailVerificationBannerProps {
  email: string;
}

const EmailVerificationBanner = ({ email }: EmailVerificationBannerProps) => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Only show the banner if the user is logged in, has an email, and is not verified
  if (!isVisible || !user || !email || user.isEmailVerified) {
    return null;
  }

  const handleResendVerification = async () => {
    setIsLoading(true);
    try {
      const response = await authService.resendVerificationEmail(user.id);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      toast.error(
        error.message ||
          'Failed to send verification email. Please try again later.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Alert className="mb-6 bg-yellow-50 border-yellow-200 relative">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-800 flex-1">
        Please verify your email address ({email}) to unlock all features.
        <Button
          variant="link"
          className="font-semibold text-yellow-800 px-1"
          onClick={handleResendVerification}
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Resend verification email'}
        </Button>
      </AlertDescription>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1 h-6 w-6 text-yellow-800 hover:bg-yellow-100"
        onClick={() => setIsVisible(false)}
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  );
};

export default EmailVerificationBanner;
