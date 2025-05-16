import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma/prisma.service';
import { TransactionStatus, TransactionType } from '@prisma/client';

export interface CreateTransactionDto {
  type: TransactionType;
  fromAddress: string;
  toAddress: string;
  amount: string;
  chainId: number;
  transactionHash: string;
  userId: string;
  relatedId?: string; // Could be lotteryId, ticketId, etc.
  metadata?: any;
}

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createTransaction(data: CreateTransactionDto) {
    this.logger.log(`Creating transaction record: ${data.transactionHash}`);

    return this.prisma.transaction.create({
      data: {
        type: data.type,
        fromAddress: data.fromAddress,
        toAddress: data.toAddress,
        amount: data.amount,
        chainId: data.chainId,
        transactionHash: data.transactionHash,
        status: TransactionStatus.PENDING,
        userId: data.userId,
        relatedId: data.relatedId,
        metadata: data.metadata || {},
      },
    });
  }

  async updateTransactionStatus(
    transactionHash: string,
    status: TransactionStatus,
    blockNumber?: number,
  ) {
    return this.prisma.transaction.update({
      where: { transactionHash },
      data: {
        status,
        blockNumber,
        updatedAt: new Date(),
      },
    });
  }

  async getTransactionByHash(transactionHash: string) {
    return this.prisma.transaction.findUnique({
      where: { transactionHash },
    });
  }

  async getUserTransactions(userId: string, type?: TransactionType) {
    const where: any = { userId };
    if (type) {
      where.type = type;
    }

    return this.prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }
}
