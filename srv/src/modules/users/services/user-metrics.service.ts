import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma/prisma.service';
import { PermissionsService } from './permissions.service';

@Injectable()
export class UserMetricsService {
  private readonly logger = new Logger(UserMetricsService.name);

  constructor(
    private prisma: PrismaService,
    private permissionsService: PermissionsService,
  ) {}

  /**
   * Record a ticket purchase for a user
   */
  async recordTicketPurchase(
    userId: string,
    quantity: number,
    amount: number,
  ): Promise<void> {
    try {
      // Update or create the user metrics record
      await this.prisma.userMetrics.upsert({
        where: { userId },
        update: {
          ticketsPurchased: { increment: quantity },
          amountSpent: { increment: amount },
        },
        create: {
          userId,
          ticketsPurchased: quantity,
          amountSpent: amount,
        },
      });

      // Evaluate permissions after updating metrics
      await this.permissionsService.evaluatePermissions(userId);
    } catch (error) {
      this.logger.error(`Error recording ticket purchase: ${error.message}`);
    }
  }

  /**
   * Get user metrics
   */
  async getUserMetrics(userId: string) {
    try {
      return await this.prisma.userMetrics.findUnique({
        where: { userId },
      });
    } catch (error) {
      this.logger.error(`Error getting user metrics: ${error.message}`);
      return null;
    }
  }
}
