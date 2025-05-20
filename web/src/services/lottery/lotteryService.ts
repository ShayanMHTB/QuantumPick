import apiClient from '@/services/api/apiClient';
import { Lottery, MOCK_LOTTERIES } from '@/data/mockLotteries';
import { LotteryTemplate } from '@/types/lottery.types';

// API version prefix
const API_PREFIX = '/api/v1';

// For development/demo, we'll use mock data with simulated API delays
const useMockData = true;

// Helper to simulate API delays
const simulateApiDelay = async <T>(data: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), 800);
  });
};

export const getCreationFee = async (type: string, chainId: number) => {
  return apiClient.get(
    `${API_PREFIX}/lotteries/creation-fee?type=${type}&chainId=${chainId}`,
    {
      authenticated: true,
    },
  );
};

// Types for API requests
export interface CreateLotteryRequest {
  templateId: string;
  name: string;
  description?: string;
  chainId: number;
  tokenAddress: string;
  ticketPrice: number;
  prizePool: number;
  startTime: string;
  endTime: string;
  drawTime: string;
  paymentTxHash?: string;
  paymentFromAddress?: string;
  prizeDistribution: {
    first: number;
    second: number;
    third: number;
  };
}

export interface UpdateLotteryRequest {
  name?: string;
  description?: string;
  ticketPrice?: number;
  maxTickets?: number;
  minTickets?: number;
  endTime?: string;
  drawTime?: string;
  prizeDistribution?: {
    first: number;
    second: number;
    third: number;
  };
}

export interface LotteryFilterParams {
  status?: string;
  chainId?: number;
  creatorId?: string;
  limit?: number;
  offset?: number;
}

// Mock implementations
const mockGetLotteries = async (
  filters?: LotteryFilterParams,
): Promise<Lottery[]> => {
  let filteredLotteries = [...MOCK_LOTTERIES];

  if (filters) {
    if (filters.status) {
      filteredLotteries = filteredLotteries.filter(
        (l) => l.status === filters.status,
      );
    }
    if (filters.chainId) {
      filteredLotteries = filteredLotteries.filter(
        (l) => l.chainId === filters.chainId,
      );
    }
    if (filters.creatorId) {
      filteredLotteries = filteredLotteries.filter(
        (l) => l.creatorId === filters.creatorId,
      );
    }
    // Implement pagination
    if (filters.limit && filters.offset !== undefined) {
      filteredLotteries = filteredLotteries.slice(
        filters.offset,
        filters.offset + filters.limit,
      );
    }
  }

  return simulateApiDelay(filteredLotteries);
};

const mockGetLotteryById = async (id: string): Promise<Lottery> => {
  const lottery = MOCK_LOTTERIES.find((l) => l.id === id);
  if (!lottery) {
    throw new Error('Lottery not found');
  }
  return simulateApiDelay(lottery);
};

const mockCreateLottery = async (
  data: CreateLotteryRequest,
): Promise<Lottery> => {
  // Convert API request format to internal Lottery type
  const newLottery: Lottery = {
    id: `new-${Date.now()}`,
    title: data.name,
    type: data.type.toLowerCase() as 'standard' | 'progressive' | 'raffle',
    status: 'pending',
    prize: '$' + (data.ticketPrice * (data.maxTickets || 100) * 0.7).toFixed(2), // Example prize calculation
    participants: 0,
    ticketPrice: '$' + data.ticketPrice,
    ticketsSold: 0,
    maxTickets: data.maxTickets,
    minTickets: data.minTickets,
    startTime: data.startTime,
    endTime: data.endTime,
    drawTime: data.drawTime,
    creatorId: 'user-123', // Would be taken from auth context in real app
    createdBy: 'you',
    chainId: data.chainId,
    tokenAddress: data.tokenAddress,
    description: data.description || '',
    prizeDistribution: data.prizeDistribution,
    createdAt: new Date().toISOString(),
  };

  console.log('Created mock lottery:', newLottery);
  return simulateApiDelay(newLottery);
};

const mockUpdateLottery = async (
  id: string,
  data: UpdateLotteryRequest,
): Promise<Lottery> => {
  const lottery = MOCK_LOTTERIES.find((l) => l.id === id);
  if (!lottery) {
    throw new Error('Lottery not found');
  }

  // Convert API request format to internal Lottery type
  const updatedData: Partial<Lottery> = {
    ...(data.name && { title: data.name }),
    ...(data.description && { description: data.description }),
    ...(data.ticketPrice && { ticketPrice: '$' + data.ticketPrice }),
    ...(data.maxTickets && { maxTickets: data.maxTickets }),
    ...(data.minTickets && { minTickets: data.minTickets }),
    ...(data.endTime && { endTime: data.endTime }),
    ...(data.drawTime && { drawTime: data.drawTime }),
    ...(data.prizeDistribution && {
      prizeDistribution: data.prizeDistribution,
    }),
  };

  const updatedLottery = { ...lottery, ...updatedData };
  return simulateApiDelay(updatedLottery);
};

const mockDeleteLottery = async (id: string): Promise<void> => {
  // In a real implementation, we'd check if the lottery exists first
  const lottery = MOCK_LOTTERIES.find((l) => l.id === id);
  if (!lottery) {
    throw new Error('Lottery not found');
  }

  return simulateApiDelay(undefined);
};

const mockDeployLottery = async (id: string): Promise<Lottery> => {
  const lottery = MOCK_LOTTERIES.find((l) => l.id === id);
  if (!lottery) {
    throw new Error('Lottery not found');
  }

  const updatedLottery = {
    ...lottery,
    status: 'active',
    contractAddress: `0x${Array(40)
      .fill(0)
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('')}`,
  };

  return simulateApiDelay(updatedLottery);
};

const mockGetLotteryParticipants = async (
  lotteryId: string,
  page = 1,
  pageSize = 10,
): Promise<any[]> => {
  // Generate mock participants
  const participants = [];
  const totalParticipants = Math.floor(Math.random() * 50) + 10; // 10-60 participants

  for (let i = 1; i <= totalParticipants; i++) {
    participants.push({
      id: `user-${i}`,
      address: `0x${Array(40)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join('')}`,
      tickets: Math.floor(Math.random() * 15) + 1,
      joinedAt: new Date(
        Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
      ).toISOString(),
      displayName: `User ${i}`,
      avatarUrl: null,
    });
  }

  // Apply pagination
  const paginatedParticipants = participants.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  return simulateApiDelay({
    data: paginatedParticipants,
    meta: {
      total: totalParticipants,
      page,
      pageSize,
      pageCount: Math.ceil(totalParticipants / pageSize),
    },
  });
};

// Lottery service with API implementation
const lotteryService = {
  // Get all lotteries with optional filtering
  getLotteries: async (filters?: LotteryFilterParams): Promise<Lottery[]> => {
    if (useMockData) {
      return mockGetLotteries(filters);
    }

    // Convert filters to query params
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.chainId)
      queryParams.append('chainId', filters.chainId.toString());
    if (filters?.creatorId) queryParams.append('creatorId', filters.creatorId);
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.offset !== undefined)
      queryParams.append('offset', filters.offset.toString());

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : '';
    return apiClient.get<Lottery[]>(`${API_PREFIX}/lotteries${queryString}`, {
      authenticated: true,
    });
  },

  // Get lottery by ID
  getLotteryById: async (id: string): Promise<Lottery> => {
    if (useMockData) {
      return mockGetLotteryById(id);
    }

    return apiClient.get<Lottery>(`${API_PREFIX}/lotteries/${id}`, {
      authenticated: true,
    });
  },

  // Create a new lottery
  createLottery: async (data: CreateLotteryRequest): Promise<Lottery> => {
    // DISABLE MOCK DATA FOR LOTTERY CREATION FOR TESTING
    const useMockDataForCreate = false; // Set to false to force real API call

    if (useMockData && useMockDataForCreate) {
      return mockCreateLottery(data);
    }

    console.log('Sending lottery creation request to API:', data);

    try {
      const response = await apiClient.post<Lottery>(
        `${API_PREFIX}/lotteries`,
        data,
        {
          authenticated: true,
        },
      );
      console.log('API response:', response);
      return response;
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  },

  // Update an existing lottery
  updateLottery: async (
    id: string,
    data: UpdateLotteryRequest,
  ): Promise<Lottery> => {
    if (useMockData) {
      return mockUpdateLottery(id, data);
    }

    return apiClient.patch<Lottery>(`${API_PREFIX}/lotteries/${id}`, data, {
      authenticated: true,
    });
  },

  // Delete a lottery
  deleteLottery: async (id: string): Promise<void> => {
    if (useMockData) {
      return mockDeleteLottery(id);
    }

    return apiClient.delete<void>(`${API_PREFIX}/lotteries/${id}`, {
      authenticated: true,
    });
  },

  // Deploy a lottery to the blockchain
  deployLottery: async (id: string): Promise<Lottery> => {
    if (useMockData) {
      return mockDeployLottery(id);
    }

    return apiClient.post<Lottery>(
      `${API_PREFIX}/lotteries/${id}/deploy`,
      {},
      { authenticated: true },
    );
  },

  // Get lottery participants
  getLotteryParticipants: async (
    lotteryId: string,
    page = 1,
    pageSize = 10,
  ): Promise<any> => {
    if (useMockData) {
      return mockGetLotteryParticipants(lotteryId, page, pageSize);
    }

    return apiClient.get<any>(
      `${API_PREFIX}/lotteries/${lotteryId}/participants?page=${page}&pageSize=${pageSize}`,
      { authenticated: true },
    );
  },

  getTemplates: async (): Promise<LotteryTemplate[]> => {
    if (useMockData) {
      // Mock templates matching backend
      return simulateApiDelay([
        {
          id: 'basic',
          name: 'Basic Lottery',
          prizeRange: { min: 2500, max: 5000 },
          ticketPrice: { min: 2, max: 5 },
          entryFeePercent: 10,
          creationFee: { flat: 100 },
          duration: { minDays: 7, maxDays: 14 },
          minParticipants: 500,
          minWinners: 1,
          maxWinners: 1,
          surplusSplit: { platform: 60, creator: 40 },
          eligibility: { minTickets: 10, minSpent: 50 },
        },
        {
          id: 'medium',
          name: 'Medium Lottery',
          prizeRange: { min: 5000, max: 25000 },
          ticketPrice: { min: 5, max: 10 },
          entryFeePercent: 10,
          creationFee: { percentOfPrize: 10 },
          duration: { minDays: 14, maxDays: 21 },
          minParticipants: 1000,
          minWinners: 1,
          maxWinners: 3,
          surplusSplit: { platform: 60, creator: 40 },
          eligibility: { minTickets: 10, minSpent: 50 },
        },
        {
          id: 'mega',
          name: 'Mega Jackpot',
          prizeRange: { min: 25000, max: 1000000 },
          ticketPrice: { min: 10, max: 20 },
          entryFeePercent: 10,
          creationFee: { percentOfPrize: 10 },
          duration: { minDays: 21, maxDays: 30 },
          minParticipants: 2500,
          minWinners: 1,
          maxWinners: 10,
          surplusSplit: { platform: 60, creator: 40 },
          eligibility: { minTickets: 10, minSpent: 50 },
        },
      ]);
    }

    return apiClient.get<LotteryTemplate[]>(
      `${API_PREFIX}/lotteries/templates`,
      {
        authenticated: true,
      },
    );
  },

  // Check user eligibility for creating lotteries
  checkEligibility: async (): Promise<{
    eligible: boolean;
    metrics: { ticketsPurchased: number; amountSpent: number };
    threshold: { minTickets: number; minSpent: number };
    progress: number;
  }> => {
    if (useMockData) {
      // Create mock eligibility data
      const ticketsPurchased = Math.floor(Math.random() * 15);
      const amountSpent = Math.floor(Math.random() * 100);
      const threshold = { minTickets: 10, minSpent: 50 };

      return simulateApiDelay({
        eligible:
          ticketsPurchased >= threshold.minTickets &&
          amountSpent >= threshold.minSpent,
        metrics: { ticketsPurchased, amountSpent },
        threshold,
        progress: Math.min(
          100,
          Math.floor(
            (ticketsPurchased / threshold.minTickets) * 50 +
              (amountSpent / threshold.minSpent) * 50,
          ),
        ),
      });
    }

    return apiClient.get<any>(`${API_PREFIX}/lotteries/eligibility`, {
      authenticated: true,
    });
  },

  // Get user tickets for a lottery
  getUserTickets: async (lotteryId: string): Promise<any> => {
    if (useMockData) {
      // Simple mock implementation
      return simulateApiDelay({
        tickets: Array(Math.floor(Math.random() * 5) + 1)
          .fill(0)
          .map((_, i) => ({
            id: `ticket-${i}`,
            lotteryId,
            purchasedAt: new Date().toISOString(),
            price: '$5',
            status: 'active',
          })),
      });
    }

    return apiClient.get<any>(
      `${API_PREFIX}/tickets/my?lotteryId=${lotteryId}`,
      { authenticated: true },
    );
  },

  // Buy tickets for a lottery
  buyTickets: async (
    lotteryId: string,
    quantity: number,
    walletAddress?: string,
  ): Promise<any> => {
    if (useMockData) {
      return simulateApiDelay({
        success: true,
        transactionId: `tx-${Date.now()}`,
        tickets: Array(quantity)
          .fill(0)
          .map((_, i) => ({
            id: `ticket-${Date.now()}-${i}`,
            lotteryId,
            purchasedAt: new Date().toISOString(),
            price: '$5',
            status: 'pending',
          })),
      });
    }

    return apiClient.post<any>(
      `${API_PREFIX}/tickets/buy`,
      {
        lotteryId,
        quantity,
        walletAddress,
      },
      { authenticated: true },
    );
  },

  getCreationFee,
};

export default lotteryService;
