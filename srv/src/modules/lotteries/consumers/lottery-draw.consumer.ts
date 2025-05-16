import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { PrismaService } from 'src/integrations/prisma/prisma.service';
import { RabbitMQService } from 'src/integrations/rabbitmq/rabbitmq.service';
import { RedisService } from 'src/integrations/redis/redis.service';
import { BlockchainsService } from 'src/modules/blockchains/services/blockchains.service';
import * as LotteryABI from '../../blockchains/abis/Lottery.json';
import { LotteryStatus } from '../entities/lottery.entity';

@Injectable()
export class LotteryDrawConsumer {
  private readonly logger = new Logger(LotteryDrawConsumer.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly blockchainService: BlockchainsService,
    private readonly redisService: RedisService,
    private readonly rabbitMQService: RabbitMQService,
    private readonly configService: ConfigService,
  ) {}

  @RabbitSubscribe({
    exchange: 'quantum.pick.exchange',
    routingKey: 'lottery.draw',
    queue: 'lottery-draw-queue',
  })
  async handleLotteryDraw(message: any): Promise<void> {
    const { lotteryId, contractAddress, chainId } = message;
    this.logger.log(`Processing lottery draw for lottery ${lotteryId}`);

    try {
      // Update draw status in Redis
      await this.updateDrawStatus(lotteryId, 'PROCESSING', {
        startedAt: new Date().toISOString(),
      });

      // Verify the lottery exists and is in DRAWING state
      const lottery = await this.prisma.lottery.findUnique({
        where: { id: lotteryId },
      });

      if (!lottery) {
        throw new Error(`Lottery ${lotteryId} not found`);
      }

      if (lottery.status !== LotteryStatus.DRAWING) {
        throw new Error(`Lottery ${lotteryId} is not in DRAWING status`);
      }

      // Get the wallet with appropriate permissions to initiate drawing
      const adminWallet = await this.getAdminWallet(chainId);

      if (!adminWallet) {
        throw new Error(
          `No admin wallet available for drawing on chain ${chainId}`,
        );
      }

      // Initiate the drawing on the blockchain
      const drawResult = await this.executeDraw(
        contractAddress,
        chainId,
        adminWallet.privateKey,
      );

      // Update the lottery with drawing results
      await this.prisma.lottery.update({
        where: { id: lotteryId },
        data: {
          drawTxHash: drawResult.transactionHash,
          // We don't set status to COMPLETED here as that will be done by the event listener
          // when the DrawCompleted event is detected
        },
      });

      // Update draw status in Redis
      await this.updateDrawStatus(lotteryId, 'COMPLETED', {
        completedAt: new Date().toISOString(),
        transactionHash: drawResult.transactionHash,
      });

      // Publish a success message
      await this.rabbitMQService.publish('lottery.drawn', {
        lotteryId,
        transactionHash: drawResult.transactionHash,
      });

      this.logger.log(
        `Successfully initiated draw for lottery ${lotteryId}, tx: ${drawResult.transactionHash}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to draw lottery ${lotteryId}: ${error.message}`,
      );

      // Update draw status in Redis
      await this.updateDrawStatus(lotteryId, 'FAILED', {
        failedAt: new Date().toISOString(),
        error: error.message,
      });

      // Publish a failure message
      await this.rabbitMQService.publish('lottery.draw.failed', {
        lotteryId,
        error: error.message,
      });
    }
  }

  private async updateDrawStatus(
    lotteryId: string,
    status: string,
    details?: any,
  ): Promise<void> {
    const key = `lottery:draw:${lotteryId}`;
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
      this.logger.error(`Failed to update draw status: ${error.message}`);
    }
  }

  private async getAdminWallet(
    chainId: number,
  ): Promise<{ address: string; privateKey: string }> {
    // In a production environment, this would use a secure key management system
    // For development, we'll use environment variables

    // For local Hardhat network (development)
    if (chainId === 1337) {
      const privateKey =
        process.env.LOTTERY_ADMIN_PRIVATE_KEY ||
        process.env.LOTTERY_DEPLOYER_PRIVATE_KEY;

      if (!privateKey) {
        throw new Error('No admin private key configured for Hardhat network');
      }

      // Derive address from private key
      const wallet = new ethers.Wallet(privateKey);

      return {
        address: wallet.address,
        privateKey,
      };
    }

    // For production networks, would implement a more secure approach
    throw new Error(
      `Admin wallet retrieval not implemented for chain ID ${chainId}`,
    );
  }

  private async executeDraw(
    contractAddress: string,
    chainId: number,
    privateKey: string,
  ): Promise<{ transactionHash: string }> {
    try {
      // Get provider for the chain
      const provider = this.blockchainService.getProvider(chainId);

      if (!provider) {
        throw new Error(`No provider available for chain ID ${chainId}`);
      }

      // Create wallet instance
      const wallet = new ethers.Wallet(privateKey, provider);

      // Create contract instance
      const contract = new ethers.Contract(contractAddress, LotteryABI, wallet);

      // Call drawWinners function
      const tx = await contract.drawWinners({
        gasLimit: 3000000n, // Adjust as needed
      });

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      return {
        transactionHash: receipt.hash,
      };
    } catch (error) {
      this.logger.error(`Error executing draw: ${error.message}`);
      throw new Error(`Blockchain error during draw: ${error.message}`);
    }
  }
}
