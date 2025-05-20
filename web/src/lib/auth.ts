import { AuthResponse, User } from '@/types/auth.types';
import { jwtVerify } from 'jose';

// Key for storing the auth token in localStorage
export const AUTH_TOKEN_KEY = 'quantum_pick_auth_token';
export const AUTH_USER_KEY = 'quantum_pick_user';

// Function to get the auth token from localStorage
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

// Function to set the auth token in localStorage
export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  
  // Set in localStorage for client-side access
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  
  // Set in cookies for middleware access (with same options as in the middleware)
  document.cookie = `${AUTH_TOKEN_KEY}=${token}; path=/; max-age=86400; samesite=lax`;
};
// Function to remove the auth token from localStorage
export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  
  // Clear from localStorage
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  
  // Clear from cookies - set an expired date to remove the cookie
  document.cookie = `${AUTH_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`;
};

// Function to store user data in localStorage
export const setUserData = (user: User): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

// Function to get user data from localStorage
export const getUserData = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userData = localStorage.getItem(AUTH_USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

// Function to verify an auth token
export const verifyToken = async (token: string): Promise<boolean> => {
  try {
    if (!token) return false;
    
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'quantum-pick-development-secret-key-2025'
    );
    
    await jwtVerify(token, secret);
    return true;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
};

// Function to check if a route is protected
export const isProtectedRoute = (pathname: string): boolean => {
  return pathname.startsWith('/dashboard');
};

// Function to handle authentication response
export const handleAuthResponse = (response: AuthResponse): void => {
  if (response.accessToken) {
    setAuthToken(response.accessToken);
  }
};

// Function to check if the user has a specific role
export const hasRole = (user: User | null, roles: string[]): boolean => {
  if (!user) return false;
  return roles.includes(user.role);
};

// Function to clear auth state on logout
export const clearAuthState = (): void => {
  removeAuthToken();
};
