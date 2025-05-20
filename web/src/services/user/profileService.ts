import apiClient from '@/services/api/apiClient';
import { Permission, PermissionProgress } from '@/types/permission.types';
import {
  UserProfile,
  UpdateProfileRequest,
  UpdatePreferencesRequest,
  Wallet,
  AddWalletRequest,
} from '@/types/profile.types';

// API version prefix
const API_PREFIX = '/api/v1';

// Profile service
const profileService = {
  // Get user profile
  getProfile: async (): Promise<UserProfile> => {
    return apiClient.get<UserProfile>(`${API_PREFIX}/profiles/me`, {
      authenticated: true,
    });
  },

  // Update user profile
  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    return apiClient.patch<UserProfile>(`${API_PREFIX}/profiles/me`, data, {
      authenticated: true,
    });
  },

  // Update user preferences
  updatePreferences: async (
    data: UpdatePreferencesRequest,
  ): Promise<UserProfile> => {
    return apiClient.patch<UserProfile>(
      `${API_PREFIX}/profiles/me/preferences`,
      data,
      {
        authenticated: true,
      },
    );
  },

  // Get user wallets
  getWallets: async (verified = true): Promise<Wallet[]> => {
    return apiClient.get<Wallet[]>(
      `${API_PREFIX}/wallets?verified=${verified}`,
      {
        authenticated: true,
      },
    );
  },

  // Add wallet
  addWallet: async (data: AddWalletRequest): Promise<Wallet> => {
    return apiClient.post<Wallet>(`${API_PREFIX}/wallets`, data, {
      authenticated: true,
    });
  },

  // Remove wallet
  removeWallet: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`${API_PREFIX}/wallets/${id}`, {
      authenticated: true,
    });
  },

  // Set primary wallet
  setPrimaryWallet: async (id: string): Promise<void> => {
    return apiClient.post<void>(
      `${API_PREFIX}/wallets/${id}/primary`,
      {},
      {
        authenticated: true,
      },
    );
  },

  // Check if user has a specific permission
  checkPermission: async (
    permission: Permission,
  ): Promise<{ hasPermission: boolean }> => {
    return apiClient.get<{ hasPermission: boolean }>(
      `${API_PREFIX}/permissions/check/${permission}`,
      { authenticated: true },
    );
  },

  // Check eligibility for lottery creation
  checkPermissionEligibility: async (
    permission: Permission,
  ): Promise<PermissionProgress> => {
    return apiClient.get<PermissionProgress>(
      `${API_PREFIX}/permissions/eligibility/${permission}`,
      { authenticated: true },
    );
  },

  // Get user permissions
  getUserPermissions: async (): Promise<Permission[]> => {
    return apiClient.get<Permission[]>(`${API_PREFIX}/permissions/my`, {
      authenticated: true,
    });
  },

  // Security operations
  security: {
    // Change password
    changePassword: async (
      currentPassword: string,
      newPassword: string,
    ): Promise<void> => {
      return apiClient.post<void>(
        `${API_PREFIX}/auth/change-password`,
        { currentPassword, newPassword },
        { authenticated: true },
      );
    },

    // Enable 2FA
    enable2FA: async (): Promise<{ secret: string; qrCode: string }> => {
      return apiClient.post<{ secret: string; qrCode: string }>(
        `${API_PREFIX}/auth/2fa/enable`,
        {},
        { authenticated: true },
      );
    },

    // Verify and complete 2FA setup
    verify2FA: async (code: string): Promise<{ verified: boolean }> => {
      return apiClient.post<{ verified: boolean }>(
        `${API_PREFIX}/auth/2fa/verify`,
        { code },
        { authenticated: true },
      );
    },

    // Disable 2FA
    disable2FA: async (code: string): Promise<{ success: boolean }> => {
      return apiClient.post<{ success: boolean }>(
        `${API_PREFIX}/auth/2fa/disable`,
        { code },
        { authenticated: true },
      );
    },

    // Status 2FA
    status2FA: async (): Promise<boolean> => {
      return apiClient.get<boolean>(`${API_PREFIX}/auth/2fa/status`, {
        authenticated: true,
      });
    },

    // Delete Account
    deleteAccount: async (id: string): Promise<{ success: boolean }> => {
      return apiClient.delete<{ success: boolean }>(
        `${API_PREFIX}/users/${id}`,
        { authenticated: true },
      );
    },
  },
};

export default profileService;
