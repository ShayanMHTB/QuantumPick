import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { Queue } from 'bull';
import { PrismaService } from 'src/integrations/prisma/prisma.service';
import { RabbitMQService } from 'src/integrations/rabbitmq/rabbitmq.service';
import { LotteryStatus } from '../entities/lottery.entity';
import { BlockchainsService } from 'src/modules/blockchains/services/blockchains.service';

@Injectable()
export class LotteryStateManager {
  private readonly logger = new Logger(LotteryStateManager.name);

  constructor(
    private prisma: PrismaService,
    private blockchainService: BlockchainsService,
    private rabbitMQService: RabbitMQService,
    private configService: ConfigService,
    @InjectQueue('lottery-state') private lotteryStateQueue: Queue,
  ) {}

  /**
   * Initialize state transitions when the application starts up
   */
  async initStateTransitions() {
    this.logger.log('Initializing lottery state transitions');

    try {
      // Schedule state transitions for all active lotteries
      const activeLotteries = await this.prisma.lottery.findMany({
        where: {
          status: LotteryStatus.ACTIVE,
          contractAddress: { not: null },
        },
      });

      for (const lottery of activeLotteries) {
        await this.scheduleLotteryStateTransitions(lottery.id);
      }

      this.logger.log(
        `Scheduled state transitions for ${activeLotteries.length} active lotteries`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to initialize state transitions: ${error.message}`,
      );
    }
  }

  /**
   * Schedule state transitions for a lottery based on its timeframes
   */
  async scheduleLotteryStateTransitions(lotteryId: string) {
    try {
      const lottery = await this.prisma.lottery.findUnique({
        where: { id: lotteryId },
      });

      if (!lottery) {
        throw new Error(`Lottery ${lotteryId} not found`);
      }

      // Only schedule for active lotteries
      if (lottery.status !== LotteryStatus.ACTIVE) {
        this.logger.log(
          `Skipping non-active lottery ${lotteryId} with status ${lottery.status}`,
        );
        return;
      }

      // Schedule transition to CLOSED when endTime is reached
      if (lottery.endTime) {
        const now = new Date();
        const endTime = new Date(lottery.endTime);

        if (endTime > now) {
          const delayMs = endTime.getTime() - now.getTime();

          await this.lotteryStateQueue.add(
            'close-lottery',
            { lotteryId: lottery.id },
            {
              delay: delayMs,
              attempts: 3,
              backoff: {
                type: 'exponential',
                delay: 5000,
              },
              removeOnComplete: true,
            },
          );

          this.logger.log(
            `Scheduled lottery ${lotteryId} to close at ${endTime.toISOString()} (in ${delayMs}ms)`,
          );
        } else {
          // End time is in the past, close it immediately
          await this.transitionToClosing(lottery.id);
        }
      }

      // Schedule transition to DRAWING when drawTime is reached
      if (lottery.drawTime) {
        const now = new Date();
        const drawTime = new Date(lottery.drawTime);

        if (drawTime > now) {
          const delayMs = drawTime.getTime() - now.getTime();

          await this.lotteryStateQueue.add(
            'draw-lottery',
            { lotteryId: lottery.id },
            {
              delay: delayMs,
              attempts: 3,
              backoff: {
                type: 'exponential',
                delay: 5000,
              },
              removeOnComplete: true,
            },
          );

          this.logger.log(
            `Scheduled lottery ${lotteryId} to draw at ${drawTime.toISOString()} (in ${delayMs}ms)`,
          );
        } else {
          // Draw time is in the past, draw it immediately
          await this.transitionToDrawing(lottery.id);
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to schedule state transitions for lottery ${lotteryId}: ${error.message}`,
      );
    }
  }

  /**
   * Transition a lottery to CLOSING state
   */
  async transitionToClosing(lotteryId: string) {
    try {
      const lottery = await this.prisma.lottery.findUnique({
        where: { id: lotteryId },
      });

      if (!lottery || lottery.status !== LotteryStatus.ACTIVE) {
        this.logger.warn(
          `Cannot close lottery ${lotteryId}: Not in ACTIVE state`,
        );
        return;
      }

      // Update lottery status
      await this.prisma.lottery.update({
        where: { id: lotteryId },
        data: { status: LotteryStatus.CLOSING },
      });

      // Publish event
      await this.rabbitMQService.publish('lottery.closing', { lotteryId });

      this.logger.log(`Transitioned lottery ${lotteryId} to CLOSING state`);
    } catch (error) {
      this.logger.error(
        `Failed to transition lottery ${lotteryId} to CLOSING: ${error.message}`,
      );
    }
  }

  /**
   * Transition a lottery to DRAWING state and initiate the draw process
   */
  async transitionToDrawing(lotteryId: string) {
    try {
      const lottery = await this.prisma.lottery.findUnique({
        where: { id: lotteryId },
      });

      if (
        !lottery ||
        (lottery.status !== LotteryStatus.ACTIVE &&
          lottery.status !== LotteryStatus.CLOSING)
      ) {
        this.logger.warn(
          `Cannot draw lottery ${lotteryId}: Not in ACTIVE or CLOSING state`,
        );
        return;
      }

      // Count tickets sold
      const ticketCount = await this.prisma.ticket.count({
        where: { lotteryId },
      });

      // Check if minimum ticket threshold is met
      if (lottery.minTickets && ticketCount < lottery.minTickets) {
        this.logger.warn(
          `Lottery ${lotteryId} did not meet minimum ticket threshold (${ticketCount}/${lottery.minTickets})`,
        );

        // Publish event for insufficient tickets
        await this.rabbitMQService.publish('lottery.insufficient_tickets', {
          lotteryId,
          actualTickets: ticketCount,
          requiredTickets: lottery.minTickets,
        });

        // Update status to CANCELLED if configured to do so
        const cancelOnInsufficientTickets = this.configService.get(
          'lottery.cancelOnInsufficientTickets',
          true,
        );

        if (cancelOnInsufficientTickets) {
          await this.prisma.lottery.update({
            where: { id: lotteryId },
            data: { status: LotteryStatus.CANCELLED },
          });

          // Queue ticket refunds
          await this.rabbitMQService.publish('lottery.refund', { lotteryId });

          this.logger.log(
            `Cancelled lottery ${lotteryId} due to insufficient tickets`,
          );
        }

        return;
      }

      // Update lottery status to DRAWING
      await this.prisma.lottery.update({
        where: { id: lotteryId },
        data: { status: LotteryStatus.DRAWING },
      });

      // Publish event to trigger the draw process
      await this.rabbitMQService.publish('lottery.draw', {
        lotteryId,
        contractAddress: lottery.contractAddress,
        chainId: lottery.chainId,
      });

      this.logger.log(
        `Transitioned lottery ${lotteryId} to DRAWING state and triggered draw process`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to transition lottery ${lotteryId} to DRAWING: ${error.message}`,
      );
    }
  }

  /**
   * Periodically check for lotteries that need state transitions
   * This serves as a backup to the scheduled tasks
   */
  @Cron('0 */5 * * * *') // Run every 5 minutes
  async checkLotteryStates() {
    this.logger.debug('Running periodic lottery state check');

    try {
      const now = new Date();

      // Find lotteries that should be closed
      const lotteriesNeedingClosure = await this.prisma.lottery.findMany({
        where: {
          status: LotteryStatus.ACTIVE,
          endTime: { lt: now },
        },
      });

      for (const lottery of lotteriesNeedingClosure) {
        this.logger.log(`Found lottery ${lottery.id} that should be closed`);
        await this.transitionToClosing(lottery.id);
      }

      // Find lotteries that should be drawn
      const lotteriesNeedingDrawing = await this.prisma.lottery.findMany({
        where: {
          OR: [
            { status: LotteryStatus.ACTIVE },
            { status: LotteryStatus.CLOSING },
          ],
          drawTime: { lt: now },
        },
      });

      for (const lottery of lotteriesNeedingDrawing) {
        this.logger.log(`Found lottery ${lottery.id} that should be drawn`);
        await this.transitionToDrawing(lottery.id);
      }
    } catch (error) {
      this.logger.error(
        `Error in periodic lottery state check: ${error.message}`,
      );
    }
  }

  /**
   * Handle a newly deployed lottery
   */
  async handleNewlyDeployedLottery(lotteryId: string) {
    try {
      const lottery = await this.prisma.lottery.findUnique({
        where: { id: lotteryId },
      });

      if (!lottery || lottery.status !== LotteryStatus.ACTIVE) {
        return;
      }

      // Schedule state transitions
      await this.scheduleLotteryStateTransitions(lotteryId);

      this.logger.log(
        `State transitions scheduled for newly deployed lottery ${lotteryId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle newly deployed lottery ${lotteryId}: ${error.message}`,
      );
    }
  }
}
