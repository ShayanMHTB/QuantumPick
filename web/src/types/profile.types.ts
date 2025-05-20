export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  socialLinks: SocialLinks;
  createdAt: string;
  preferences: UserPreferences;
}

export interface SocialLinks {
  twitter?: string | null;
  discord?: string | null;
  telegram?: string | null;
}

export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  twoFactorEnabled: boolean;
}

export interface Wallet {
  id: string;
  address: string;
  chainId: number;
  isPrimary: boolean;
  nickname: string | null;
  lastUsed?: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  socialLinks?: SocialLinks;
}

export interface UpdatePreferencesRequest {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  marketingEmails?: boolean;
}

export interface AddWalletRequest {
  address: string;
  chainId: number;
  nickname?: string;
  signature: string;
  message: string;
}

export interface ProfileState {
  profile: UserProfile | null;
  wallets: Wallet[];
  isLoading: boolean;
  error: string | null;
  isUpdating: boolean;
}
