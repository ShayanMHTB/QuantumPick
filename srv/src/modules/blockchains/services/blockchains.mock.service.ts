import { Injectable, Logger } from '@nestjs/common';
import { IBlockchainProvider } from '../interfaces/blockchain-provider.interface';

@Injectable()
export class BlockchainsMockService implements IBlockchainProvider {
  private readonly logger = new Logger(BlockchainsMockService.name);
  private mockContracts: Map<string, string> = new Map(); // lotteryId -> contractAddress

  async deployLottery(
    chainId: number,
    tokenAddress: string,
    ticketPrice: string,
    maxTickets: number | null,
    minTickets: number | null,
    startTime: Date | null,
    endTime: Date | null,
    drawTime: Date | null,
    prizeDistribution: any,
    creatorWalletAddress: string,
    privateKey: string, // Keep parameter for compatibility, but don't use it
  ) {
    this.logger.log(
      `[MOCK] Deploying lottery on chain ${chainId} by ${creatorWalletAddress}`,
    );
    // Generate a mock contract address
    const contractAddress = `0x${Array(40)
      .fill(0)
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('')}`;
    // Store it for future reference
    this.mockContracts.set(
      contractAddress,
      JSON.stringify({
        chainId,
        tokenAddress,
        ticketPrice,
        creatorWalletAddress,
        // other details
      }),
    );
    return {
      contractAddress,
      transactionHash: `0x${Array(64)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join('')}`,
    };
  }

  // Add mock implementation for buying tickets
  async buyTickets(
    lotteryAddress: string,
    chainId: number,
    quantity: number,
    userWalletAddress: string,
    privateKey: string, // Don't use this
  ) {
    this.logger.log(
      `[MOCK] Buying ${quantity} tickets for lottery at ${lotteryAddress} by ${userWalletAddress}`,
    );

    // Simulate transaction hash
    return {
      transactionHash: `0x${Array(64)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join('')}`,
    };
  }

  // Add mock implementation for checking if user can buy tickets
  async canBuyTickets(
    lotteryAddress: string,
    chainId: number,
    userAddress: string,
    quantity: number,
  ) {
    this.logger.log(
      `[MOCK] Checking if ${userAddress} can buy ${quantity} tickets`,
    );

    // For testing, always return true
    return { canBuy: true, reason: '' };
  }

  // Mock getting lottery details
  async getLotteryDetails(lotteryAddress: string, chainId: number) {
    this.logger.log(`[MOCK] Getting details for lottery at ${lotteryAddress}`);

    return {
      tokenAddress: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
      ticketPrice: '5000000', // 5 USDC with 6 decimals
      maxTickets: '100',
      minTickets: '5',
      startTime: new Date(Date.now() - 86400000), // Yesterday
      endTime: new Date(Date.now() + 86400000), // Tomorrow
      drawTime: new Date(Date.now() + 172800000), // Day after tomorrow
      totalTickets: '0',
      status: 1, // Active
    };
  }

  // Add mock implementation for getting a provider
  getProvider(chainId: number) {
    this.logger.log(`[MOCK] Getting provider for chain ${chainId}`);

    // Return a mock provider object with minimal functionality
    return {
      getNetwork: async () => ({ chainId }),
      getBlockNumber: async () => Math.floor(Date.now() / 1000),
    };
  }

  // Add mock implementation for drawing lottery
  async drawLottery(
    lotteryAddress: string,
    chainId: number,
    adminWalletAddress: string,
    privateKey: string,
  ) {
    this.logger.log(
      `[MOCK] Drawing lottery at ${lotteryAddress} by ${adminWalletAddress}`,
    );

    // Generate random winning numbers (e.g., 3 winners)
    const winningNumbers = Array(3)
      .fill(0)
      .map(() => Math.floor(Math.random() * 100) + 1);

    return {
      transactionHash: `0x${Array(64)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join('')}`,
      winningNumbers,
    };
  }

  // Add mock implementation for finalizing lottery
  async finalizeLottery(
    lotteryAddress: string,
    chainId: number,
    adminWalletAddress: string,
    privateKey: string,
  ) {
    this.logger.log(
      `[MOCK] Finalizing lottery at ${lotteryAddress} by ${adminWalletAddress}`,
    );

    return {
      transactionHash: `0x${Array(64)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join('')}`,
    };
  }

  // Add mock implementation for canceling lottery
  async cancelLottery(
    lotteryAddress: string,
    chainId: number,
    adminWalletAddress: string,
    privateKey: string,
  ) {
    this.logger.log(
      `[MOCK] Canceling lottery at ${lotteryAddress} by ${adminWalletAddress}`,
    );

    return {
      transactionHash: `0x${Array(64)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join('')}`,
    };
  }

  // Add mock implementation for getting user tickets
  async getUserTickets(
    lotteryAddress: string,
    chainId: number,
    userAddress: string,
  ) {
    this.logger.log(
      `[MOCK] Getting tickets for user ${userAddress} in lottery ${lotteryAddress}`,
    );

    // Return empty array for now
    return [];
  }

  // Mock implementation for checking token allowance
  async checkAllowance(
    tokenAddress: string,
    chainId: number,
    userAddress: string,
    spenderAddress: string,
  ) {
    this.logger.log(
      `[MOCK] Checking allowance for ${userAddress} to ${spenderAddress}`,
    );

    // Return a large allowance
    return '1000000000000000000000';
  }

  // Mock implementation for getting token balance
  async getTokenBalance(
    tokenAddress: string,
    chainId: number,
    userAddress: string,
  ) {
    this.logger.log(`[MOCK] Getting token balance for ${userAddress}`);

    // Return a reasonable balance
    return '100000000000'; // 100,000 tokens with 6 decimals
  }

  // Mock implementation for watching lottery events
  async watchLotteryEvents(
    lotteryAddress: string,
    chainId: number,
    eventCallback: (event: any) => Promise<void>,
  ) {
    this.logger.log(
      `[MOCK] Setting up event watcher for lottery ${lotteryAddress}`,
    );

    // Return a mock unsubscribe function
    return () => {
      this.logger.log(
        `[MOCK] Stopped watching events for lottery ${lotteryAddress}`,
      );
    };
  }

  // Get web3 contract instance (mock)
  getContract(lotteryAddress: string, chainId: number) {
    this.logger.log(`[MOCK] Getting contract instance for ${lotteryAddress}`);

    // Return a mock contract object
    return {
      address: lotteryAddress,
      methods: {
        // Add mock methods as needed based on your lottery contract
        ticketPrice: () => ({
          call: async () => '5000000',
        }),
        totalTickets: () => ({
          call: async () => '42',
        }),
        // Add more mock methods as needed
      },
    };
  }

  // Mock token transfer
  async transferTokens(
    tokenAddress: string,
    chainId: number,
    fromAddress: string,
    toAddress: string,
    amount: string,
    privateKey: string,
  ) {
    this.logger.log(
      `[MOCK] Transferring ${amount} tokens from ${fromAddress} to ${toAddress}`,
    );

    return {
      transactionHash: `0x${Array(64)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join('')}`,
    };
  }
}
