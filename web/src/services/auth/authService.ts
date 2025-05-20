import apiClient from '@/services/api/apiClient';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  SiweMessageRequest,
  SiweVerifyRequest,
  TwoFactorVerifyRequest,
  TwoFactorLoginRequest,
  User,
} from '@/types/auth.types';

// API version prefix
const API_PREFIX = '/api/v1';

// Authentication service
const authService = {
  // Traditional login with email and password
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>(
      `${API_PREFIX}/auth/login`,
      credentials,
    );
  },

  // Register a new user with email and password
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>(
      `${API_PREFIX}/auth/register`,
      userData,
    );
  },

  // Logout the current user
  logout: async (): Promise<void> => {
    return apiClient.post<void>(
      `${API_PREFIX}/auth/logout`,
      {},
      { authenticated: true },
    );
  },

  // Get the current user profile
  getCurrentUser: async (): Promise<User> => {
    return apiClient.get<User>(`${API_PREFIX}/auth/me`, {
      authenticated: true,
    });
  },

  verifyEmail: async (
    token: string,
  ): Promise<{ success: boolean; message?: string }> => {
    return apiClient.post<{ success: boolean; message?: string }>(
      `${API_PREFIX}/auth/email/verify`,
      { token },
    );
  },

  resendVerificationEmail: async (
    userId: string,
  ): Promise<{ success: boolean; message: string; previewUrl?: string }> => {
    return apiClient.post<{
      success: boolean;
      message: string;
      previewUrl?: string;
    }>(`${API_PREFIX}/auth/email/resend`, {}, { authenticated: true });
  },

  // For users who are not logged in and need to resend verification
  resendPublicVerificationEmail: async (
    email: string,
  ): Promise<{ success: boolean; message: string }> => {
    return apiClient.post<{ success: boolean; message: string }>(
      `${API_PREFIX}/auth/email/resend-public`,
      { email },
    );
  },

  checkEmailVerificationStatus: async (): Promise<{ isVerified: boolean }> => {
    return apiClient.get<{ isVerified: boolean }>(
      `${API_PREFIX}/auth/email/status`,
      { authenticated: true },
    );
  },

  // SIWE (Sign-In with Ethereum) methods
  siwe: {
    // Get a SIWE message for the given address and chain ID
    getMessage: async (request: SiweMessageRequest): Promise<string> => {
      try {
        const response = await apiClient.post<{ message: string }>(
          `${API_PREFIX}/auth/siwe/message`,
          request,
        );

        // Handle both possible response formats:
        // 1. { message: "..." } - the correct JSON format
        // 2. "..." - the raw string format (current issue)

        if (typeof response === 'string') {
          // If the response is a raw string, return it directly
          return response;
        } else if (
          response &&
          typeof response === 'object' &&
          'message' in response
        ) {
          // If the response is a JSON object with a message property, return that
          return response.message;
        } else {
          throw new Error('Invalid response format from SIWE message endpoint');
        }
      } catch (error) {
        console.error('Error getting SIWE message:', error);
        throw error;
      }
    },

    // Verify a SIWE signature
    verify: async (request: SiweVerifyRequest): Promise<AuthResponse> => {
      try {
        return apiClient.post<AuthResponse>(
          `${API_PREFIX}/auth/siwe/verify`,
          request,
        );
      } catch (error) {
        console.error('Error verifying SIWE message:', error);
        throw error;
      }
    },
  },

  // Two-factor authentication methods
  twoFactor: {
    // Enable 2FA for the current user
    enable: async (): Promise<{ secret: string; qrCode: string }> => {
      return apiClient.post<{ secret: string; qrCode: string }>(
        `${API_PREFIX}/auth/2fa/enable`,
        {},
        { authenticated: true },
      );
    },

    // Disable 2FA for the current user
    disable: async (
      request: TwoFactorVerifyRequest,
    ): Promise<{ success: boolean }> => {
      return apiClient.post<{ success: boolean }>(
        `${API_PREFIX}/auth/2fa/disable`,
        request,
        { authenticated: true },
      );
    },

    // Verify 2FA setup for the current user
    verify: async (
      request: TwoFactorVerifyRequest,
    ): Promise<{ verified: boolean }> => {
      return apiClient.post<{ verified: boolean }>(
        `${API_PREFIX}/auth/2fa/verify`,
        request,
        { authenticated: true },
      );
    },

    // Login with 2FA
    login: async (request: TwoFactorLoginRequest): Promise<AuthResponse> => {
      return apiClient.post<AuthResponse>(
        `${API_PREFIX}/auth/2fa/login`,
        request,
      );
    },

    // Check 2FA Status
    status: async (): Promise<{ status: boolean }> => {
      return apiClient.get<{ status: boolean }>(
        `${API_PREFIX}/auth/2fa/status`,
        { authenticated: true },
      );
    },
  },
};

export default authService;
