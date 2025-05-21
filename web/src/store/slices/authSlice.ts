import {
  clearAuthState,
  getAuthToken,
  getUserData,
  handleAuthResponse,
  setUserData,
} from '@/lib/auth';
import authService from '@/services/auth/authService';
import profileService from '@/services/user/profileService';
import {
  AuthState,
  LoginRequest,
  RegisterRequest,
  SiweVerifyRequest,
  TwoFactorVerifyRequest,
  User,
} from '@/types/auth.types';
import { Permission } from '@/types/permission.types';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Initial state for the auth slice
const initialState: AuthState = {
  user: getUserData(),
  accessToken: getAuthToken(),
  isLoading: false,
  isAuthenticated: !!getAuthToken(),
  error: null,
  requiresTwoFactor: false,
  pendingTwoFactorAuth: undefined,
  permissionsLoading: false,
  isEmailVerified: false,
  emailVerificationLoading: false,
};

// Async thunks for authentication actions
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);

      // If the response indicates 2FA is required
      if (response.requiresTwoFactor) {
        // Return the response with pending credentials
        return { ...response, pendingCredentials: credentials };
      }

      // Otherwise handle normal login
      handleAuthResponse(response);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  },
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      handleAuthResponse(response);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  },
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      clearAuthState();
      return null;
    } catch (error: any) {
      // Still clear local state even if the server logout fails
      clearAuthState();
      return rejectWithValue(error.message || 'Logout failed');
    }
  },
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser();
      setUserData(user);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get current user');
    }
  },
);

export const verifyTwoFactor = createAsyncThunk(
  'auth/verifyTwoFactor',
  async (
    {
      code,
      email,
      password,
    }: TwoFactorVerifyRequest & { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await authService.twoFactor.login({
        email,
        password,
        code,
      });
      handleAuthResponse(response);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Two-factor verification failed');
    }
  },
);

export const siweVerify = createAsyncThunk(
  'auth/siweVerify',
  async (data: SiweVerifyRequest, { rejectWithValue }) => {
    try {
      const response = await authService.siwe.verify(data);

      if (response.requiresTwoFactor) {
        return { ...response, pendingWeb3: true };
      }

      handleAuthResponse(response);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'SIWE verification failed');
    }
  },
);

export const fetchUserPermissions = createAsyncThunk(
  'auth/fetchUserPermissions',
  async (_, { rejectWithValue }) => {
    try {
      const permissions = await profileService.getUserPermissions();
      return permissions;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch permissions');
    }
  },
);

export const checkEmailVerification = createAsyncThunk(
  'auth/checkEmailVerification',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.checkEmailVerificationStatus();
      return response.isVerified;
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to check email verification status',
      );
    }
  },
);

export const resendVerificationEmail = createAsyncThunk(
  'auth/resendVerificationEmail',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.resendVerificationEmail();
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to resend verification email',
      );
    }
  },
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Reset the error state
    resetError: (state) => {
      state.error = null;
    },
    // Set loading state manually
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    // Clear two-factor pending state
    clearTwoFactorPending: (state) => {
      state.pendingTwoFactorAuth = undefined;
      state.requiresTwoFactor = false;
    },
  },
  extraReducers: (builder) => {
    // Login reducers
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;

      if (action.payload.requiresTwoFactor) {
        state.requiresTwoFactor = true;
        state.pendingTwoFactorAuth = action.payload.pendingCredentials;
        return;
      }

      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user as User;
      state.requiresTwoFactor = false;
      state.pendingTwoFactorAuth = undefined;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Register reducers
    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user as User;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Logout reducers
    builder.addCase(logout.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.accessToken = null;
      state.user = null;
      state.requiresTwoFactor = false;
      state.pendingTwoFactorAuth = undefined;
    });
    builder.addCase(logout.rejected, (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.accessToken = null;
      state.user = null;
      state.requiresTwoFactor = false;
      state.pendingTwoFactorAuth = undefined;
    });

    // Get current user reducers
    builder.addCase(getCurrentUser.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getCurrentUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    });
    builder.addCase(getCurrentUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
    });

    // Two-factor verification reducers
    builder.addCase(verifyTwoFactor.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(verifyTwoFactor.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user as User;
      state.requiresTwoFactor = false;
      state.pendingTwoFactorAuth = undefined;
    });
    builder.addCase(verifyTwoFactor.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // SIWE verification reducers
    builder.addCase(siweVerify.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(siweVerify.fulfilled, (state, action) => {
      state.isLoading = false;

      if (action.payload.requiresTwoFactor) {
        state.requiresTwoFactor = true;
        return;
      }

      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user as User;
    });
    builder.addCase(siweVerify.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Email Verification reducers
    builder.addCase(checkEmailVerification.pending, (state) => {
      state.emailVerificationLoading = true;
    });
    builder.addCase(checkEmailVerification.fulfilled, (state, action) => {
      state.emailVerificationLoading = false;
      state.isEmailVerified = action.payload;
      if (state.user) {
        state.user.isEmailVerified = action.payload;
      }
    });
    builder.addCase(checkEmailVerification.rejected, (state) => {
      state.emailVerificationLoading = false;
    });

    builder.addCase(resendVerificationEmail.pending, (state) => {
      state.emailVerificationLoading = true;
    });
    builder.addCase(resendVerificationEmail.fulfilled, (state) => {
      state.emailVerificationLoading = false;
    });
    builder.addCase(resendVerificationEmail.rejected, (state) => {
      state.emailVerificationLoading = false;
    });

    // Permissions reducers
    builder.addCase(fetchUserPermissions.pending, (state) => {
      state.permissionsLoading = true;
    });
    builder.addCase(
      fetchUserPermissions.fulfilled,
      (state, action: PayloadAction<Permission[]>) => {
        state.permissionsLoading = false;
        if (state.user) {
          state.user.permissions = action.payload;
        }
      },
    );
    builder.addCase(fetchUserPermissions.rejected, (state) => {
      state.permissionsLoading = false;
    });
  },
});

// Export actions and reducer
export const { resetError, setLoading, clearTwoFactorPending } =
  authSlice.actions;
export default authSlice.reducer;
