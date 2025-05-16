import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma/prisma.service';
import { RabbitMQService } from 'src/integrations/rabbitmq/rabbitmq.service';
import { RedisService } from 'src/integrations/redis/redis.service';
import { BlockchainsService } from 'src/modules/blockchains/services/blockchains.service';

@Injectable()
export class TicketPurchaseConsumer {
  private readonly logger = new Logger(TicketPurchaseConsumer.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly blockchainService: BlockchainsService,
    private readonly redisService: RedisService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  @RabbitSubscribe({
    exchange: 'quantum.pick.exchange',
    routingKey: 'ticket.purchase',
    queue: 'ticket-purchase-queue',
  })
  async handleTicketPurchase(message: any): Promise<void> {
    const {
      purchaseId,
      lotteryId,
      userId,
      walletAddress,
      chainId,
      contractAddress,
      quantity,
      privateKey,
    } = message;
    this.logger.log(
      `Processing ticket purchase for lottery ${lotteryId}, user ${userId}`,
    );

    try {
      // Update purchase status in Redis
      await this.updatePurchaseStatus(purchaseId, 'PROCESSING', {
        startedAt: new Date().toISOString(),
      });

      // Verify the lottery exists and is active
      const lottery = await this.prisma.lottery.findUnique({
        where: { id: lotteryId },
      });

      if (!lottery || lottery.contractAddress !== contractAddress) {
        throw new Error(`Invalid lottery data for ${lotteryId}`);
      }

      // Execute the purchase transaction
      const purchaseResult = await this.blockchainService.buyTickets(
        contractAddress,
        chainId,
        quantity,
        walletAddress,
        privateKey,
      );

      // Update the purchase status in Redis
      await this.updatePurchaseStatus(purchaseId, 'SUBMITTED', {
        transactionHash: purchaseResult.transactionHash,
        submittedAt: new Date().toISOString(),
      });

      this.logger.log(
        `Ticket purchase transaction submitted: ${purchaseResult.transactionHash}`,
      );

      // Note: We don't create ticket records here - that will be done by the blockchain event listener
      // when the TicketPurchased event is detected, to ensure consistency with the blockchain state

      // Publish a success message
      await this.rabbitMQService.publish('ticket.purchase.submitted', {
        purchaseId,
        lotteryId,
        userId,
        walletAddress,
        quantity,
        transactionHash: purchaseResult.transactionHash,
      });
    } catch (error) {
      this.logger.error(
        `Failed to process ticket purchase ${purchaseId}: ${error.message}`,
      );

      // Update purchase status in Redis
      await this.updatePurchaseStatus(purchaseId, 'FAILED', {
        failedAt: new Date().toISOString(),
        error: error.message,
      });

      // Publish a failure message
      await this.rabbitMQService.publish('ticket.purchase.failed', {
        purchaseId,
        lotteryId,
        userId,
        error: error.message,
      });
    }
  }

  private async updatePurchaseStatus(
    purchaseId: string,
    status: string,
    details?: any,
  ): Promise<void> {
    const key = `ticket:purchase:${purchaseId}`;
    try {
      // Get the existing status record if it exists
      const existingStatus = (await this.redisService.get(key)) || {};

      // Update with new status and details
      const updatedStatus = {
        ...existingStatus,
        status,
        ...(details || {}),
        updatedAt: new Date().toISOString(),
      };

      await this.redisService.set(key, updatedStatus, 60 * 60 * 24); // Store for 24 hours
    } catch (error) {
      this.logger.error(`Failed to update purchase status: ${error.message}`);
    }
  }
}
