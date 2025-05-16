import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma/prisma.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class PlatformEarningsService {
  private readonly logger = new Logger(PlatformEarningsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async recordPlatformEarning(data: {
    transactionId: string;
    lotteryId?: string;
    amount: string;
    chainId: number;
    earningType: string;
  }) {
    this.logger.log(
      `Recording platform earning: ${data.amount} from ${data.earningType}`,
    );

    return this.prisma.platformEarning.create({
      data: {
        transactionId: data.transactionId,
        lotteryId: data.lotteryId,
        amount: data.amount,
        chainId: data.chainId,
        earningType: data.earningType,
      },
    });
  }

  async getTotalEarnings(chainId?: number) {
    const where: any = {};
    if (chainId) {
      where.chainId = chainId;
    }

    // First, check what fields exist on PlatformEarning
    const earnings = await this.prisma.platformEarning.findMany({
      where,
    });

    // If amount field exists as string, sum manually
    const total = earnings.reduce((sum, earning) => {
      // Convert string to number for summing
      const amount = earning.amount ? parseFloat(earning.amount) : 0;
      return sum + amount;
    }, 0);

    return total.toString();
  }

  async getEarningsByType(earningType: string, chainId?: number) {
    const where: any = { earningType };
    if (chainId) {
      where.chainId = chainId;
    }

    return this.prisma.platformEarning.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }
}
