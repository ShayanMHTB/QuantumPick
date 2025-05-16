import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma/prisma.service';
import { RedisService } from 'src/integrations/redis/redis.service';

@Injectable()
export class TicketPurchaseCompletionService {
  private readonly logger = new Logger(TicketPurchaseCompletionService.name);

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {
    // Initialize the background process
    this.initializeBackgroundProcess();
  }

  private async initializeBackgroundProcess() {
    // Wait for 2 seconds to allow the server to fully start
    setTimeout(() => {
      this.startTicketCompletionProcess();
    }, 2000);
  }

  private async startTicketCompletionProcess() {
    this.logger.log('Starting mock ticket completion process');

    // Run this process every 5 seconds
    setInterval(async () => {
      try {
        // Find all keys in Redis that match our pattern
        const keys = await this.redisService.getAllKeys();
        const purchaseKeys = keys.filter((k) =>
          k.startsWith('ticket:purchase:'),
        );

        if (purchaseKeys.length === 0) {
          return; // No purchases to process
        }

        // Process each pending purchase
        for (const key of purchaseKeys) {
          const purchase = await this.redisService.get(key);

          // Only process purchases that are in PENDING or SUBMITTED status
          if (
            purchase &&
            (purchase.status === 'PENDING' || purchase.status === 'SUBMITTED')
          ) {
            await this.simulateTicketPurchaseCompletion(key, purchase);
          }
        }
      } catch (error) {
        this.logger.error(
          `Error in ticket completion process: ${error.message}`,
        );
      }
    }, 5000);
  }

  private async simulateTicketPurchaseCompletion(key: string, purchase: any) {
    try {
      this.logger.log(`Simulating completion of ticket purchase: ${key}`);

      // First update the status to PROCESSING
      await this.redisService.set(key, {
        ...purchase,
        status: 'PROCESSING',
        processingAt: new Date().toISOString(),
      });

      // Get lottery details
      const lottery = await this.prisma.lottery.findUnique({
        where: { id: purchase.lotteryId },
      });

      if (!lottery) {
        throw new Error(`Lottery ${purchase.lotteryId} not found`);
      }

      // Generate mock ticket numbers
      const ticketNumbers = [];

      // Get current max ticket number for this lottery
      const maxTicket = await this.prisma.ticket.findFirst({
        where: { lotteryId: purchase.lotteryId },
        orderBy: { ticketNumber: 'desc' },
      });

      const startNumber = maxTicket ? maxTicket.ticketNumber + 1 : 1;

      // Create ticket records
      for (let i = 0; i < purchase.quantity; i++) {
        const ticketNumber = startNumber + i;
        ticketNumbers.push(ticketNumber);

        await this.prisma.ticket.create({
          data: {
            lotteryId: purchase.lotteryId,
            purchaserId: purchase.userId,
            walletId:
              purchase.walletId ||
              // Fallback: get user's primary wallet
              (
                await this.prisma.wallet.findFirst({
                  where: {
                    userId: purchase.userId,
                    address: purchase.walletAddress,
                  },
                })
              )?.id,
            ticketNumber,
            txHash:
              purchase.transactionHash ||
              `0x${Array(64)
                .fill(0)
                .map(() => Math.floor(Math.random() * 16).toString(16))
                .join('')}`,
          },
        });
      }

      // Update the purchase status to COMPLETED
      await this.redisService.set(
        key,
        {
          ...purchase,
          status: 'COMPLETED',
          completedAt: new Date().toISOString(),
          ticketNumbers,
        },
        60 * 60 * 24,
      ); // 24 hours expiry

      this.logger.log(
        `Created ${ticketNumbers.length} tickets for purchase ${key}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to simulate purchase completion: ${error.message}`,
      );

      // Update the status to FAILED
      await this.redisService.set(key, {
        ...purchase,
        status: 'FAILED',
        failedAt: new Date().toISOString(),
        error: error.message,
      });
    }
  }
}
