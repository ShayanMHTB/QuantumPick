import { Lottery, MOCK_LOTTERIES } from '@/data/mockLotteries';
import lotteryService, {
  CreateLotteryRequest,
} from '@/services/lottery/lotteryService';
import { LotteryTemplate } from '@/types/lottery.types';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define types for the slice state
export interface LotteryState {
  lotteries: Lottery[];
  currentLottery: Lottery | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status: string;
    search: string;
    type: string;
  };
  pagination: {
    page: number;
    perPage: number;
    total: number;
  };
  templates: LotteryTemplate[];
  eligibility: {
    checked: boolean;
    eligible: boolean;
    metrics: { ticketsPurchased: number; amountSpent: number };
    threshold: { minTickets: number; minSpent: number };
    progress: number;
  } | null;
}

// Define initial state
const initialState: LotteryState = {
  lotteries: [],
  currentLottery: null,
  isLoading: false,
  error: null,
  filters: {
    status: 'all',
    search: '',
    type: 'all',
  },
  pagination: {
    page: 1,
    perPage: 5,
    total: 0,
  },
  templates: [],
  eligibility: null,
};

// Async thunks
export const fetchLotteries = createAsyncThunk(
  'lottery/fetchLotteries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await lotteryService.getLotteries();
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch lotteries',
      );
    }
  },
);

export const fetchLotteryById = createAsyncThunk(
  'lottery/fetchLotteryById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await lotteryService.getLotteryById(id);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch lottery',
      );
    }
  },
);

export const fetchTemplates = createAsyncThunk(
  'lottery/fetchTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await lotteryService.getTemplates();
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch templates',
      );
    }
  },
);

export const checkEligibility = createAsyncThunk(
  'lottery/checkEligibility',
  async (_, { rejectWithValue }) => {
    try {
      const response = await lotteryService.checkEligibility();
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to check eligibility',
      );
    }
  },
);

export const createLottery = createAsyncThunk(
  'lottery/createLottery',
  async (lotteryData: CreateLotteryRequest, { rejectWithValue }) => {
    try {
      console.log('Creating lottery with data:', lotteryData);
      const response = await lotteryService.createLottery(lotteryData);
      return response;
    } catch (error) {
      console.error('Error creating lottery:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to create lottery',
      );
    }
  },
);

export const updateLottery = createAsyncThunk(
  'lottery/updateLottery',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await lotteryService.updateLottery(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to update lottery',
      );
    }
  },
);

export const deleteLottery = createAsyncThunk(
  'lottery/deleteLottery',
  async (id: string, { rejectWithValue }) => {
    try {
      await lotteryService.deleteLottery(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to delete lottery',
      );
    }
  },
);

export const deployLottery = createAsyncThunk(
  'lottery/deployLottery',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await lotteryService.deployLottery(id);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to deploy lottery',
      );
    }
  },
);

// Create the lottery slice
const lotterySlice = createSlice({
  name: 'lottery',
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<LotteryState['filters']>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page when filters change
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    clearCurrentLottery: (state) => {
      state.currentLottery = null;
    },
    // For development/testing only
    setMockLotteries: (state) => {
      state.lotteries = MOCK_LOTTERIES;
      state.isLoading = false;
      state.pagination.total = MOCK_LOTTERIES.length;
    },
  },
  extraReducers: (builder) => {
    // fetchLotteries
    builder.addCase(fetchLotteries.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchLotteries.fulfilled, (state, action) => {
      state.isLoading = false;
      state.lotteries = action.payload;
      state.pagination.total = action.payload.length;
    });
    builder.addCase(fetchLotteries.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // fetchLotteryById
    builder.addCase(fetchLotteryById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchLotteryById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentLottery = action.payload;
    });
    builder.addCase(fetchLotteryById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // createLottery
    builder.addCase(createLottery.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createLottery.fulfilled, (state, action) => {
      state.isLoading = false;
      state.lotteries = [action.payload, ...state.lotteries];
      state.pagination.total += 1;
    });
    builder.addCase(createLottery.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // updateLottery
    builder.addCase(updateLottery.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateLottery.fulfilled, (state, action) => {
      state.isLoading = false;
      state.lotteries = state.lotteries.map((lottery) =>
        lottery.id === action.payload.id ? action.payload : lottery,
      );
      if (state.currentLottery?.id === action.payload.id) {
        state.currentLottery = action.payload;
      }
    });
    builder.addCase(updateLottery.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // deleteLottery
    builder.addCase(deleteLottery.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteLottery.fulfilled, (state, action) => {
      state.isLoading = false;
      state.lotteries = state.lotteries.filter(
        (lottery) => lottery.id !== action.payload,
      );
      state.pagination.total -= 1;
      if (state.currentLottery?.id === action.payload) {
        state.currentLottery = null;
      }
    });
    builder.addCase(deleteLottery.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // deployLottery
    builder.addCase(deployLottery.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deployLottery.fulfilled, (state, action) => {
      state.isLoading = false;
      state.lotteries = state.lotteries.map((lottery) =>
        lottery.id === action.payload.id
          ? { ...lottery, ...action.payload }
          : lottery,
      );
      if (state.currentLottery?.id === action.payload.id) {
        state.currentLottery = { ...state.currentLottery, ...action.payload };
      }
    });
    builder.addCase(deployLottery.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Lottery Creation
    builder.addCase(fetchTemplates.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchTemplates.fulfilled, (state, action) => {
      state.isLoading = false;
      state.templates = action.payload;
    });
    builder.addCase(fetchTemplates.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(checkEligibility.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(checkEligibility.fulfilled, (state, action) => {
      state.isLoading = false;
      state.eligibility = {
        checked: true,
        ...action.payload,
      };
    });
    builder.addCase(checkEligibility.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setFilters, setPage, clearCurrentLottery, setMockLotteries } =
  lotterySlice.actions;

export default lotterySlice.reducer;
