import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { TransactionsService } from '../services/transactions.service';
import { TransactionVerificationService } from '../services/transaction-verification.service';
import { PlatformEarningsService } from '../services/platform-earnings.service';
import { TransactionStatus } from '@prisma/client';

interface VerifyTransactionJob {
  transactionHash: string;
  chainId: number;
  expectedAmount: string;
  expectedToAddress: string;
  transactionId: string;
  lotteryId?: string;
}

@Processor('transactions')
export class TransactionProcessor {
  private readonly logger = new Logger(TransactionProcessor.name);

  constructor(
    private transactionsService: TransactionsService,
    private verificationService: TransactionVerificationService,
    private earningsService: PlatformEarningsService,
  ) {}

  @Process('verify-transaction')
  async handleTransactionVerification(job: Job<VerifyTransactionJob>) {
    const { data } = job;
    this.logger.log(
      `Processing transaction verification: ${data.transactionHash}`,
    );

    try {
      // Verify the transaction on blockchain
      const verification = await this.verificationService.verifyTransaction({
        transactionHash: data.transactionHash,
        chainId: data.chainId,
        expectedAmount: data.expectedAmount,
        expectedToAddress: data.expectedToAddress,
      });

      if (verification.isValid) {
        // Update transaction status to confirmed
        await this.transactionsService.updateTransactionStatus(
          data.transactionHash,
          TransactionStatus.CONFIRMED,
          verification.blockNumber,
        );

        // Record platform earning if this is a lottery creation fee
        if (data.lotteryId) {
          await this.earningsService.recordPlatformEarning({
            transactionId: data.transactionId,
            lotteryId: data.lotteryId,
            amount: data.expectedAmount,
            chainId: data.chainId,
            earningType: 'LOTTERY_CREATION_FEE',
          });
        }

        this.logger.log(
          `Transaction verified successfully: ${data.transactionHash}`,
        );
      } else {
        // Update transaction status to failed
        await this.transactionsService.updateTransactionStatus(
          data.transactionHash,
          TransactionStatus.FAILED,
        );

        this.logger.error(
          `Transaction verification failed: ${verification.error}`,
        );
      }
    } catch (error) {
      this.logger.error(`Error processing transaction: ${error.message}`);

      // Update transaction status to error
      await this.transactionsService.updateTransactionStatus(
        data.transactionHash,
        TransactionStatus.FAILED,
      );
    }
  }
}
