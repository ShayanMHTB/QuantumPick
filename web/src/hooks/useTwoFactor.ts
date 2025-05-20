import { useState, useCallback } from 'react';
import { useAppSelector } from '@/store';
import authService from '@/services/auth/authService';

// Hook for 2FA functionality
const useTwoFactor = () => {
  const { user, isAuthenticated } = useAppSelector(state => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupData, setSetupData] = useState<{ secret: string; qrCode: string } | null>(null);

  // Enable 2FA
  const enable = useCallback(async () => {
    if (!isAuthenticated) {
      setError('You must be authenticated to enable 2FA');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await authService.twoFactor.enable();
      setSetupData(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to enable 2FA');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Verify 2FA setup
  const verify = useCallback(async (code: string) => {
    if (!isAuthenticated) {
      setError('You must be authenticated to verify 2FA');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await authService.twoFactor.verify({ code });
      return result.verified;
    } catch (err: any) {
      setError(err.message || 'Failed to verify 2FA');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Disable 2FA
  const disable = useCallback(async (code: string) => {
    if (!isAuthenticated) {
      setError('You must be authenticated to disable 2FA');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await authService.twoFactor.disable({ code });
      return result.success;
    } catch (err: any) {
      setError(err.message || 'Failed to disable 2FA');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Reset the setup data
  const resetSetupData = useCallback(() => {
    setSetupData(null);
  }, []);

  return {
    isEnabled: user?.twoFactorEnabled || false,
    isLoading,
    error,
    setupData,
    enable,
    verify,
    disable,
    resetSetupData,
    clearError: () => setError(null)
  };
};

export default useTwoFactor;
