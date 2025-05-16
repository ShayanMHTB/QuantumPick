import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { BlockchainsService } from 'src/modules/blockchains/services/blockchains.service';
import { BlockchainsMockService } from 'src/modules/blockchains/services/blockchains.mock.service';

export interface VerifyTransactionDto {
  transactionHash: string;
  chainId: number;
  expectedAmount: string;
  expectedToAddress: string;
}

@Injectable()
export class TransactionVerificationService {
  private readonly logger = new Logger(TransactionVerificationService.name);

  constructor(
    @Inject('BLOCKCHAIN_SERVICE')
    private blockchainService: BlockchainsService | BlockchainsMockService,
    private configService: ConfigService,
  ) {}

  async verifyTransaction(dto: VerifyTransactionDto): Promise<{
    isValid: boolean;
    blockNumber?: number;
    actualAmount?: string;
    error?: string;
  }> {
    this.logger.log(`Verifying transaction: ${dto.transactionHash}`);

    try {
      // For development with mock service
      if (this.blockchainService instanceof BlockchainsMockService) {
        this.logger.log('[MOCK] Simulating transaction verification');

        // Simulate successful verification for testing
        return {
          isValid: true,
          blockNumber: Math.floor(Date.now() / 1000),
          actualAmount: dto.expectedAmount,
        };
      }

      // For real blockchain service
      const provider = this.blockchainService.getProvider(dto.chainId);
      if (!provider) {
        return { isValid: false, error: 'Invalid chain ID' };
      }

      // Get transaction receipt
      const receipt = await provider.getTransactionReceipt(dto.transactionHash);

      if (!receipt) {
        return { isValid: false, error: 'Transaction not found' };
      }

      // Get transaction details
      const tx = await provider.getTransaction(dto.transactionHash);

      if (!tx) {
        return { isValid: false, error: 'Transaction details not found' };
      }

      // Basic verification
      const isToAddressValid =
        tx.to?.toLowerCase() === dto.expectedToAddress.toLowerCase();
      const isAmountValid = tx.value.toString() === dto.expectedAmount;
      const isConfirmed = receipt.status === 1;

      if (!isToAddressValid) {
        return { isValid: false, error: 'Invalid recipient address' };
      }

      if (!isAmountValid) {
        return {
          isValid: false,
          error: `Amount mismatch. Expected: ${dto.expectedAmount}, Got: ${tx.value.toString()}`,
        };
      }

      if (!isConfirmed) {
        return { isValid: false, error: 'Transaction failed or reverted' };
      }

      return {
        isValid: true,
        blockNumber: receipt.blockNumber,
        actualAmount: tx.value.toString(),
      };
    } catch (error) {
      this.logger.error(`Error verifying transaction: ${error.message}`);
      return { isValid: false, error: error.message };
    }
  }

  // For development - get platform fee receiver address
  getPlatformFeeAddress(chainId: number): string {
    // In production, this would come from config or environment
    const devAddress = this.configService.get<string>('PLATFORM_FEE_ADDRESS');

    if (chainId === 1337) {
      // Hardhat
      // Use a test address - this should be one of your Hardhat accounts
      return devAddress || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
    }

    // For other networks, return configured address
    return devAddress || '0x0000000000000000000000000000000000000000';
  }

  // Calculate platform fee (simplified for testing)
  calculatePlatformFee(lotteryType: string): string {
    // Simple fixed fee in wei for testing
    // 0.01 ETH = 10000000000000000 wei
    return '10000000000000000';
  }
}
