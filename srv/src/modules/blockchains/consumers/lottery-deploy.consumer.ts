import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma/prisma.service';
import { RabbitMQService } from 'src/integrations/rabbitmq/rabbitmq.service';
import { RedisService } from 'src/integrations/redis/redis.service';
import { BlockchainsService } from '../services/blockchains.service';
import { LotteryStatus } from 'src/modules/lotteries/entities/lottery.entity';

@Injectable()
export class LotteryDeployConsumer {
  private readonly logger = new Logger(LotteryDeployConsumer.name);

  constructor(
    private readonly blockchainService: BlockchainsService,
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  @RabbitSubscribe({
    exchange: 'quantum.pick.exchange',
    routingKey: 'lottery.deploy',
    queue: 'lottery-deploy-queue',
  })
  async handleLotteryDeployment(message: any): Promise<void> {
    this.logger.log(`Processing lottery deployment: ${message.lotteryId}`);

    try {
      // Update deployment status in Redis
      await this.updateDeploymentStatus(message.lotteryId, 'PROCESSING', {
        startedAt: new Date().toISOString(),
      });

      // Verify the lottery exists and is in PENDING state
      const lottery = await this.prisma.lottery.findUnique({
        where: { id: message.lotteryId },
      });

      if (!lottery) {
        throw new Error(`Lottery ${message.lotteryId} not found`);
      }

      if (lottery.status !== LotteryStatus.PENDING) {
        throw new Error(
          `Lottery ${message.lotteryId} is not in PENDING status`,
        );
      }

      // Get creator's wallet address for the specified chain
      const creatorWallet = await this.prisma.wallet.findFirst({
        where: {
          userId: lottery.creatorId,
          chainId: message.chainId,
          isVerified: true,
        },
      });

      if (!creatorWallet) {
        throw new Error(
          `No verified wallet found for lottery creator on chain ${message.chainId}`,
        );
      }

      // Get the private key from a secure source or keystore service
      // For development with Hardhat, we'll use environment variable
      const privateKey = process.env.LOTTERY_DEPLOYER_PRIVATE_KEY;

      if (!privateKey) {
        throw new Error('No deployment private key configured');
      }

      // Deploy the contract
      const deploymentResult = await this.blockchainService.deployLottery(
        message.chainId,
        message.tokenAddress,
        message.ticketPrice,
        message.maxTickets,
        message.minTickets,
        message.startTime ? new Date(message.startTime) : null,
        message.endTime ? new Date(message.endTime) : null,
        message.drawTime ? new Date(message.drawTime) : null,
        message.prizeDistribution,
        creatorWallet.address,
        privateKey,
      );

      // Update the lottery with the contract address
      await this.prisma.lottery.update({
        where: { id: message.lotteryId },
        data: {
          contractAddress: deploymentResult.contractAddress,
          status: LotteryStatus.ACTIVE,
          drawTxHash: deploymentResult.transactionHash,
        },
      });

      // Update deployment status in Redis
      await this.updateDeploymentStatus(message.lotteryId, 'COMPLETED', {
        completedAt: new Date().toISOString(),
        contractAddress: deploymentResult.contractAddress,
        transactionHash: deploymentResult.transactionHash,
      });

      // Publish a success message
      await this.rabbitMQService.publish('lottery.deployed', {
        lotteryId: message.lotteryId,
        contractAddress: deploymentResult.contractAddress,
        transactionHash: deploymentResult.transactionHash,
      });

      this.logger.log(
        `Successfully deployed lottery ${message.lotteryId} at ${deploymentResult.contractAddress}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to deploy lottery ${message.lotteryId}: ${error.message}`,
      );

      // Update lottery status to DRAFT (failed deployment)
      try {
        await this.prisma.lottery.update({
          where: { id: message.lotteryId },
          data: { status: LotteryStatus.DRAFT },
        });
      } catch (dbError) {
        this.logger.error(
          `Failed to update lottery status: ${dbError.message}`,
        );
      }

      // Update deployment status in Redis
      await this.updateDeploymentStatus(message.lotteryId, 'FAILED', {
        failedAt: new Date().toISOString(),
        error: error.message,
      });

      // Publish a failure message
      await this.rabbitMQService.publish('lottery.deployment.failed', {
        lotteryId: message.lotteryId,
        error: error.message,
      });
    }
  }

  private async updateDeploymentStatus(
    lotteryId: string,
    status: string,
    details?: any,
  ): Promise<void> {
    const key = `lottery:deployment:${lotteryId}`;
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
      this.logger.error(`Failed to update deployment status: ${error.message}`);
    }
  }
}
