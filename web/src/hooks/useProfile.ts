import profileService from '@/services/user/profileService';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  addWallet,
  deleteAccount,
  fetchProfile,
  fetchWallets,
  removeWallet,
  resetProfileError,
  setPrimaryWallet,
  updatePreferences,
  updateProfile,
} from '@/store/slices/profileSlice';
import {
  AddWalletRequest,
  UpdatePreferencesRequest,
  UpdateProfileRequest,
} from '@/types/profile.types';
import { useCallback } from 'react';
import { toast } from 'sonner';

const useProfile = () => {
  const dispatch = useAppDispatch();
  const { profile, wallets, isLoading, error, isUpdating } = useAppSelector(
    (state) => state.profile,
  );

  const getProfile = useCallback(async () => {
    try {
      await dispatch(fetchProfile()).unwrap();
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Failed to load profile');
    }
  }, [dispatch]);

  const getWallets = useCallback(
    async (verified = true) => {
      try {
        await dispatch(fetchWallets(verified)).unwrap();
      } catch (error) {
        toast.error(
          typeof error === 'string' ? error : 'Failed to load wallets',
        );
      }
    },
    [dispatch],
  );

  const updateUserProfile = useCallback(
    async (data: UpdateProfileRequest) => {
      try {
        await dispatch(updateProfile(data)).unwrap();
        toast.success('Profile updated successfully');
        return true;
      } catch (error) {
        toast.error(
          typeof error === 'string' ? error : 'Failed to update profile',
        );
        return false;
      }
    },
    [dispatch],
  );

  const updateUserPreferences = useCallback(
    async (data: UpdatePreferencesRequest) => {
      try {
        await dispatch(updatePreferences(data)).unwrap();
        toast.success('Preferences updated successfully');
        return true;
      } catch (error) {
        toast.error(
          typeof error === 'string' ? error : 'Failed to update preferences',
        );
        return false;
      }
    },
    [dispatch],
  );

  const addUserWallet = useCallback(
    async (data: AddWalletRequest) => {
      try {
        await dispatch(addWallet(data)).unwrap();
        toast.success('Wallet added successfully');
        return true;
      } catch (error) {
        toast.error(typeof error === 'string' ? error : 'Failed to add wallet');
        return false;
      }
    },
    [dispatch],
  );

  const removeUserWallet = useCallback(
    async (id: string) => {
      try {
        await dispatch(removeWallet(id)).unwrap();
        toast.success('Wallet removed successfully');
        return true;
      } catch (error) {
        toast.error(
          typeof error === 'string' ? error : 'Failed to remove wallet',
        );
        return false;
      }
    },
    [dispatch],
  );

  const setUserPrimaryWallet = useCallback(
    async (id: string) => {
      try {
        await dispatch(setPrimaryWallet(id)).unwrap();
        toast.success('Primary wallet updated successfully');
        return true;
      } catch (error) {
        toast.error(
          typeof error === 'string' ? error : 'Failed to update primary wallet',
        );
        return false;
      }
    },
    [dispatch],
  );

  // Security functions
  const change2FAStatus = useCallback(
    async (enable: boolean, verificationCode?: string) => {
      try {
        if (enable) {
          // First step: Get QR code and secret
          if (!verificationCode) {
            const result = await profileService.security.enable2FA();
            return {
              success: true,
              qrCode: result.qrCode,
              secret: result.secret,
            };
          } else {
            // Second step: Verify the code
            const result = await profileService.security.verify2FA(
              verificationCode,
            );
            if (result.verified) {
              toast.success('Two-factor authentication enabled successfully');
              // Refresh profile to update 2FA status
              await dispatch(fetchProfile());
            }
            return { success: result.verified };
          }
        } else {
          // Disable 2FA
          if (!verificationCode) {
            throw new Error('Verification code is required to disable 2FA');
          }
          const result = await profileService.security.disable2FA(
            verificationCode,
          );
          if (result.success) {
            toast.success('Two-factor authentication disabled successfully');
            // Refresh profile to update 2FA status
            await dispatch(fetchProfile());
          }
          return { success: result.success };
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to update 2FA status');
        return { success: false, error: error.message };
      }
    },
    [dispatch],
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      try {
        await profileService.security.changePassword(
          currentPassword,
          newPassword,
        );
        toast.success('Password changed successfully');
        return true;
      } catch (error: any) {
        toast.error(error.message || 'Failed to change password');
        return false;
      }
    },
    [],
  );

  const check2FAStatus = useCallback(async () => {
    try {
      const response = await profileService.security.status2FA();
      return response.status; // Now using .status property
    } catch (error: any) {
      toast.error(error.message || 'Failed to check 2FA status');
      return false;
    }
  }, []);

  const clearProfileError = useCallback(() => {
    dispatch(resetProfileError());
  }, [dispatch]);

  const deleteUserAccount = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await dispatch(deleteAccount(id)).unwrap();
        toast.success('Account deleted successfully');
        return true;
      } catch (error) {
        toast.error(
          typeof error === 'string' ? error : 'Failed to delete account',
        );
        return false;
      }
    },
    [dispatch],
  );

  return {
    profile,
    wallets,
    isLoading,
    isUpdating,
    error,
    getProfile,
    getWallets,
    updateProfile: updateUserProfile,
    updatePreferences: updateUserPreferences,
    addWallet: addUserWallet,
    removeWallet: removeUserWallet,
    setPrimaryWallet: setUserPrimaryWallet,
    changePassword,
    change2FAStatus,
    check2FAStatus,
    clearError: clearProfileError,
    deleteAccount: deleteUserAccount,
  };
};

export default useProfile;
