import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  ProfileState,
  UserProfile,
  UpdateProfileRequest,
  UpdatePreferencesRequest,
  Wallet,
  AddWalletRequest,
} from '@/types/profile.types';
import profileService from '@/services/user/profileService';

// Initial state
const initialState: ProfileState = {
  profile: null,
  wallets: [],
  isLoading: false,
  error: null,
  isUpdating: false,
};

// Async thunks
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await profileService.getProfile();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch profile');
    }
  },
);

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (data: UpdateProfileRequest, { rejectWithValue }) => {
    try {
      return await profileService.updateProfile(data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  },
);

export const updatePreferences = createAsyncThunk(
  'profile/updatePreferences',
  async (data: UpdatePreferencesRequest, { rejectWithValue }) => {
    try {
      return await profileService.updatePreferences(data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update preferences');
    }
  },
);

export const fetchWallets = createAsyncThunk(
  'profile/fetchWallets',
  async (verified: boolean = true, { rejectWithValue }) => {
    try {
      return await profileService.getWallets(verified);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch wallets');
    }
  },
);

export const addWallet = createAsyncThunk(
  'profile/addWallet',
  async (data: AddWalletRequest, { rejectWithValue }) => {
    try {
      return await profileService.addWallet(data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add wallet');
    }
  },
);

export const removeWallet = createAsyncThunk(
  'profile/removeWallet',
  async (id: string, { rejectWithValue }) => {
    try {
      await profileService.removeWallet(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to remove wallet');
    }
  },
);

export const setPrimaryWallet = createAsyncThunk(
  'profile/setPrimaryWallet',
  async (id: string, { rejectWithValue }) => {
    try {
      await profileService.setPrimaryWallet(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to set primary wallet');
    }
  },
);

export const deleteAccount = createAsyncThunk(
  'profile/deleteAccount',
  async (id: string, { rejectWithValue }) => {
    try {
      const result = await profileService.security.deleteAccount(id);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete account');
    }
  },
);

// Profile slice
const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    resetProfileError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchProfile reducers
    builder.addCase(fetchProfile.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchProfile.fulfilled, (state, action) => {
      state.isLoading = false;
      state.profile = action.payload;
    });
    builder.addCase(fetchProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // updateProfile reducers
    builder.addCase(updateProfile.pending, (state) => {
      state.isUpdating = true;
      state.error = null;
    });
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.isUpdating = false;
      state.profile = action.payload;
    });
    builder.addCase(updateProfile.rejected, (state, action) => {
      state.isUpdating = false;
      state.error = action.payload as string;
    });

    // updatePreferences reducers
    builder.addCase(updatePreferences.pending, (state) => {
      state.isUpdating = true;
      state.error = null;
    });
    builder.addCase(updatePreferences.fulfilled, (state, action) => {
      state.isUpdating = false;
      state.profile = action.payload;
    });
    builder.addCase(updatePreferences.rejected, (state, action) => {
      state.isUpdating = false;
      state.error = action.payload as string;
    });

    // fetchWallets reducers
    builder.addCase(fetchWallets.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchWallets.fulfilled, (state, action) => {
      state.isLoading = false;
      state.wallets = action.payload;
    });
    builder.addCase(fetchWallets.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // addWallet reducers
    builder.addCase(addWallet.pending, (state) => {
      state.isUpdating = true;
      state.error = null;
    });
    builder.addCase(addWallet.fulfilled, (state, action) => {
      state.isUpdating = false;
      state.wallets = [...state.wallets, action.payload];
    });
    builder.addCase(addWallet.rejected, (state, action) => {
      state.isUpdating = false;
      state.error = action.payload as string;
    });

    // removeWallet reducers
    builder.addCase(removeWallet.pending, (state) => {
      state.isUpdating = true;
      state.error = null;
    });
    builder.addCase(removeWallet.fulfilled, (state, action) => {
      state.isUpdating = false;
      state.wallets = state.wallets.filter(
        (wallet) => wallet.id !== action.payload,
      );
    });
    builder.addCase(removeWallet.rejected, (state, action) => {
      state.isUpdating = false;
      state.error = action.payload as string;
    });

    // setPrimaryWallet reducers
    builder.addCase(setPrimaryWallet.pending, (state) => {
      state.isUpdating = true;
      state.error = null;
    });
    builder.addCase(setPrimaryWallet.fulfilled, (state, action) => {
      state.isUpdating = false;
      state.wallets = state.wallets.map((wallet) => ({
        ...wallet,
        isPrimary: wallet.id === action.payload,
      }));
    });
    builder.addCase(setPrimaryWallet.rejected, (state, action) => {
      state.isUpdating = false;
      state.error = action.payload as string;
    });

    // deleteAccount reducers
    builder.addCase(deleteAccount.pending, (state) => {
      state.isUpdating = true;
      state.error = null;
    });
    builder.addCase(deleteAccount.fulfilled, (state) => {
      state.isUpdating = false;
      // We don't need to update state further as the user will be logged out
    });
    builder.addCase(deleteAccount.rejected, (state, action) => {
      state.isUpdating = false;
      state.error = action.payload as string;
    });
  },
});

export const { resetProfileError } = profileSlice.actions;
export default profileSlice.reducer;
