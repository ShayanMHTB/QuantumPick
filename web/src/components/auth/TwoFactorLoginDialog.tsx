import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useAuth from '@/hooks/useAuth';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';

// Validation schema for 2FA code - validating the actual digits without space
const twoFactorSchema = z.object({
  code: z
    .string()
    .transform((val) => val.replace(/\s/g, '')) // Remove spaces before validation
    .refine((val) => val.length === 6, 'Code must be exactly 6 digits')
    .refine((val) => /^\d+$/.test(val), 'Code must only contain digits'),
});

type TwoFactorFormValues = z.infer<typeof twoFactorSchema>;

const TwoFactorLoginDialog = () => {
  const {
    requiresTwoFactor,
    verifyTwoFactor,
    cancelTwoFactor,
    error,
    isLoading,
  } = useAuth();
  const router = useRouter();
  const [verificationError, setVerificationError] = useState<string | null>(
    null,
  );

  const [callbackUrl, setCallbackUrl] = useState<string>('/dashboard');

  useEffect(() => {
    // Get the callbackUrl from the query string if it exists
    const params = new URLSearchParams(window.location.search);
    const callback = params.get('callbackUrl') || '/dashboard';
    setCallbackUrl(callback);
  }, []);

  // Initialize form with react-hook-form
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TwoFactorFormValues>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      code: '',
    },
  });

  // Function to format code with space after first 3 digits
  const formatCode = (value: string) => {
    // Remove any existing spaces first
    const digitsOnly = value.replace(/\s/g, '');

    // Only keep digits
    const numbersOnly = digitsOnly.replace(/[^\d]/g, '');

    // Limit to 6 digits
    const truncated = numbersOnly.slice(0, 6);

    // Add space after first 3 digits if we have more than 3 digits
    if (truncated.length > 3) {
      return `${truncated.slice(0, 3)} ${truncated.slice(3)}`;
    }

    return truncated;
  };

  // Handle form submission
  const onSubmit = async (data: TwoFactorFormValues) => {
    setVerificationError(null);
    try {
      // Remove the space before sending to the backend
      const cleanCode = data.code.replace(/\s/g, '');

      const result = await verifyTwoFactor(cleanCode);

      if (result && result.accessToken) {
        router.push(callbackUrl);
      } else {
        setVerificationError(
          'Authentication failed - no access token received',
        );
      }
    } catch (err: any) {
      console.error('2FA verification error:', err);
      setVerificationError(err.message || 'Verification failed');
    }
  };

  return (
    <Dialog
      open={requiresTwoFactor}
      onOpenChange={(open) => !open && cancelTwoFactor()}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Enter the 6-digit code from your authenticator app to verify your
            identity.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {(error || verificationError) && (
            <Alert variant="destructive">
              <AlertDescription>{error || verificationError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <Controller
              name="code"
              control={control}
              render={({ field }) => (
                <Input
                  id="code"
                  placeholder="123 456"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  maxLength={7} // Account for space (6 digits + 1 space)
                  {...field}
                  value={formatCode(field.value)}
                  onChange={(e) => {
                    const formattedValue = formatCode(e.target.value);
                    field.onChange(formattedValue);
                  }}
                />
              )}
            />
            {errors.code && (
              <p className="text-sm text-red-500">{errors.code.message}</p>
            )}
          </div>

          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="outline" onClick={cancelTwoFactor}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TwoFactorLoginDialog;
