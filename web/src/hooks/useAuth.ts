import { handleAuthResponse } from '@/lib/auth';
import authService from '@/services/auth/authService';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  clearTwoFactorPending,
  getCurrentUser,
  login,
  logout,
  register,
  resetError,
  setLoading,
  verifyTwoFactor,
} from '@/store/slices/authSlice';
import { LoginRequest, RegisterRequest } from '@/types/auth.types';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { SiweMessage } from 'siwe';

// Hook for authentication functionality
const useAuth = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Select auth state from Redux
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    requiresTwoFactor,
    pendingTwoFactorAuth,
  } = useAppSelector((state) => state.auth);

  // Check authentication status on mount and redirect if needed
  useEffect(() => {
    if (isAuthenticated && user) {
      // Already authenticated, no need to fetch again
      return;
    }

    // Only try to get current user if we have a token but no user
    if (!isAuthenticated) {
      // Check if there's a token in localStorage
      const token = localStorage.getItem('quantum_pick_auth_token');
      if (token) {
        dispatch(getCurrentUser());
      }
    }
  }, [dispatch, isAuthenticated, user]);

  // Handle login
  const handleLogin = useCallback(
    async (credentials: LoginRequest) => {
      return dispatch(login(credentials)).unwrap();
    },
    [dispatch],
  );

  // Handle registration
  const handleRegister = useCallback(
    async (userData: RegisterRequest) => {
      return dispatch(register(userData)).unwrap();
    },
    [dispatch],
  );

  // Handle logout
  const handleLogout = useCallback(async () => {
    await dispatch(logout());
    router.push('/');
  }, [dispatch, router]);

  // Handle two-factor verification
  const handleTwoFactorVerify = useCallback(
    async (code: string) => {
      if (!pendingTwoFactorAuth) return null;

      try {
        const response = await dispatch(
          verifyTwoFactor({
            code,
            email: pendingTwoFactorAuth.email,
            password: pendingTwoFactorAuth.password,
          }),
        ).unwrap();

        return response;
      } catch (error) {
        throw error;
      }
    },
    [dispatch, pendingTwoFactorAuth],
  );

  // Cancel two-factor authentication
  const cancelTwoFactor = useCallback(() => {
    dispatch(clearTwoFactorPending());
  }, [dispatch]);

  // Clear authentication errors
  const clearError = useCallback(() => {
    dispatch(resetError());
  }, [dispatch]);

  // Handle SIWE authentication
  const handleWeb3Login = useCallback(
    async (address: string, chainId: number) => {
      try {
        clearError();
        dispatch(setLoading(true));

        // Direct API calls for better error handling
        // Get SIWE message
        const message = await authService.siwe.getMessage({ address, chainId });

        // Prepare the SIWE message object
        const siweMessage = new SiweMessage(message);

        // Request signature from wallet (this will be handled by the Web3 provider)
        if (typeof window.ethereum !== 'undefined') {
          // Request account access if needed
          await window.ethereum.request({ method: 'eth_requestAccounts' });

          // Get the signer
          const signature = await window.ethereum.request({
            method: 'personal_sign',
            params: [message, address, ''],
          });

          // Verify the signature
          const response = await authService.siwe.verify({
            message,
            signature,
          });

          // Handle auth response
          handleAuthResponse(response);

          // Update Redux state
          if (response.user) {
            dispatch({
              type: 'auth/web3LoginSuccess',
              payload: response,
            });
          }

          return response;
        } else {
          throw new Error('Ethereum provider not found');
        }
      } catch (error: any) {
        console.error('Web3 login error:', error);
        dispatch({
          type: 'auth/web3LoginFailure',
          payload: error.message || 'Web3 login failed',
        });
        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, clearError],
  );

  // Return auth state and methods
  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    requiresTwoFactor,
    pendingTwoFactorAuth,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    verifyTwoFactor: handleTwoFactorVerify,
    cancelTwoFactor,
    web3Login: handleWeb3Login,
    clearError,
  };
};

export default useAuth;
