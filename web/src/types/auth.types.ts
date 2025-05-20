import { Permission } from './permission.types';

export enum AuthSource {
  TRADITIONAL = 'TRADITIONAL',
  WEB3 = 'WEB3',
  BOTH = 'BOTH',
}

export enum UserRole {
  USER = 'USER',
  CREATOR = 'CREATOR',
  PREMIUM = 'PREMIUM',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
}

export interface UserProfile {
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  socialLinks?: Record<string, string>;
  preferences?: Record<string, any>;
}

export interface Wallet {
  id: string;
  address: string;
  chainId: number;
  isPrimary: boolean;
  nickname?: string;
  lastUsedAt?: string;
}

export interface User {
  id: string;
  email?: string;
  role: UserRole;
  status: UserStatus;
  authSource: AuthSource;
  profile?: UserProfile;
  permissions?: Permission[];
  wallets?: Wallet[];
  twoFactorEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Authentication request and response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName?: string;
}

export interface TwoFactorVerifyRequest {
  code: string;
}

export interface TwoFactorLoginRequest extends LoginRequest {
  code: string;
}

export interface SiweMessageRequest {
  address: string;
  chainId: number;
}

export interface SiweVerifyRequest {
  message: string;
  signature: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email?: string;
    wallet?: string;
    role: UserRole;
  };
  requiresTwoFactor?: boolean;
}

// Auth state for the application
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  requiresTwoFactor: boolean;
  pendingTwoFactorAuth?: {
    email: string;
    password: string;
  };
  permissionsLoading: boolean;
  isEmailVerified: boolean;
  emailVerificationLoading: boolean;
}
