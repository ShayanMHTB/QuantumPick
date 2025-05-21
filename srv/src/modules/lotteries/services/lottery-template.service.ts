import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { lotteryTemplates } from '../config/templates.config';
import { LotteryTemplateInterface } from '../interfaces/lottery-template.interface';
import { PrismaService } from 'src/integrations/prisma/prisma.service';

@Injectable()
export class LotteryTemplateService {
  private readonly logger = new Logger(LotteryTemplateService.name);

  constructor(private readonly prisma: PrismaService) {}

  getAllTemplates(): LotteryTemplateInterface[] {
    return Object.values(lotteryTemplates);
  }

  getTemplateById(templateId: string): LotteryTemplateInterface {
    const template = lotteryTemplates[templateId];

    if (!template) {
      throw new NotFoundException(`Template with ID ${templateId} not found`);
    }

    return template;
  }

  async validateUserEligibility(userId: string): Promise<boolean> {
    // Get user's purchase metrics
    const userMetrics = await this.prisma.userMetrics.findUnique({
      where: { userId },
    });

    if (!userMetrics) {
      return false;
    }

    // Check against the minimum requirements (same for all templates)
    const minTicketsRequired = lotteryTemplates.basic.eligibility.minTickets;
    const minSpentRequired = lotteryTemplates.basic.eligibility.minSpent;

    return (
      userMetrics.ticketsPurchased >= minTicketsRequired &&
      parseFloat(userMetrics.amountSpent.toString()) >= minSpentRequired
    );
  }

  calculateCreationFee(templateId: string, prizePool: number): number {
    const template = this.getTemplateById(templateId);

    if (template.creationFee.flat) {
      return template.creationFee.flat;
    }

    if (template.creationFee.percentOfPrize) {
      return (template.creationFee.percentOfPrize / 100) * prizePool;
    }

    return 0;
  }

  validateLotteryParams(
    templateId: string,
    ticketPrice: number,
    prizePool: number,
    startTime?: Date,
    endTime?: Date,
  ): void {
    const template = this.getTemplateById(templateId);

    // Validate ticket price
    if (
      ticketPrice < template.ticketPrice.min ||
      ticketPrice > template.ticketPrice.max
    ) {
      throw new BadRequestException(
        `Ticket price must be between ${template.ticketPrice.min} and ${template.ticketPrice.max}`,
      );
    }

    // Validate prize pool
    if (
      prizePool < template.prizeRange.min ||
      prizePool > template.prizeRange.max
    ) {
      throw new BadRequestException(
        `Prize pool must be between ${template.prizeRange.min} and ${template.prizeRange.max}`,
      );
    }

    // Validate duration if both dates provided
    if (startTime && endTime) {
      const durationDays = Math.ceil(
        (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (
        durationDays < template.duration.minDays ||
        durationDays > template.duration.maxDays
      ) {
        throw new BadRequestException(
          `Lottery duration must be between ${template.duration.minDays} and ${template.duration.maxDays} days`,
        );
      }
    }
  }

  // Calculate minimum tickets needed based on prize pool and ticket price
  calculateMinTickets(prizePool: number, ticketPrice: number): number {
    // Ensure we reach the prize pool with minimal overage
    return Math.ceil(prizePool / ticketPrice);
  }

  // Additional methods to handle surplus calculation, winner distribution, etc.
  calculateSurplusDistribution(
    templateId: string,
    totalCollected: number,
    prizePool: number,
  ): { platformAmount: number; creatorAmount: number } {
    if (totalCollected <= prizePool) {
      return { platformAmount: 0, creatorAmount: 0 };
    }

    const template = this.getTemplateById(templateId);
    const surplus = totalCollected - prizePool;

    return {
      platformAmount: (surplus * template.surplusSplit.platform) / 100,
      creatorAmount: (surplus * template.surplusSplit.creator) / 100,
    };
  }
}
