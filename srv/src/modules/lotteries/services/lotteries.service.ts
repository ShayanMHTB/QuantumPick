import { InjectQueue } from '@nestjs/bull';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import { Queue } from 'bull';
import { PrismaService } from 'src/integrations/prisma/prisma.service';
import { RabbitMQService } from 'src/integrations/rabbitmq/rabbitmq.service';
import { RedisService } from 'src/integrations/redis/redis.service';
import { BlockchainsService } from 'src/modules/blockchains/services/blockchains.service';
import { TransactionVerificationService } from 'src/modules/transactions/services/transaction-verification.service';
import { TransactionsService } from 'src/modules/transactions/services/transactions.service';
import { BlockchainsMockService } from '../../blockchains/services/blockchains.mock.service';
import { WalletsService } from '../../wallets/services/wallets.service';
import { CreateLotteryDto } from '../dtos/create-lottery.dto';
import { LotteryStatus, LotteryType } from '../entities/lottery.entity';

@Injectable()
export class LotteriesService {
  private readonly logger = new Logger(LotteriesService.name);

  constructor(
    private prisma: PrismaService,
    private walletsService: WalletsService,
    private redisService: RedisService,
    private rabbitMQService: RabbitMQService,
    private transactionsService: TransactionsService,
    private verificationService: TransactionVerificationService,
    @InjectQueue('transactions') private transactionQueue: Queue,

    @Inject('BLOCKCHAIN_SERVICE')
    private blockchainService: BlockchainsService | BlockchainsMockService,
  ) {}

  async create(
    createLotteryDto: CreateLotteryDto & {
      paymentTxHash?: string;
      paymentFromAddress?: string;
    },
    userId: string,
  ) {
    // Check user permissions
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (
      !(
        user.role === 'ADMIN' ||
        user.role === 'CREATOR' ||
        user.role === 'PREMIUM'
      )
    ) {
      throw new ForbiddenException(
        'Insufficient permissions to create a lottery',
      );
    }

    // Find a suitable wallet for deployment
    const wallets = await this.prisma.wallet.findMany({
      where: {
        userId,
        chainId: createLotteryDto.chainId,
        isVerified: true,
      },
      orderBy: { isPrimary: 'desc' },
    });

    if (wallets.length === 0) {
      throw new BadRequestException(
        `No verified wallet found for chain ID ${createLotteryDto.chainId}`,
      );
    }

    // Create lottery in DRAFT status first
    const lottery = await this.prisma.lottery.create({
      data: {
        name: createLotteryDto.name,
        description: createLotteryDto.description,
        type: createLotteryDto.type || LotteryType.STANDARD,
        status: LotteryStatus.DRAFT,
        chainId: createLotteryDto.chainId,
        tokenAddress: createLotteryDto.tokenAddress,
        ticketPrice: createLotteryDto.ticketPrice,
        maxTickets: createLotteryDto.maxTickets,
        minTickets: createLotteryDto.minTickets,
        startTime: createLotteryDto.startTime
          ? new Date(createLotteryDto.startTime)
          : null,
        endTime: createLotteryDto.endTime
          ? new Date(createLotteryDto.endTime)
          : null,
        drawTime: createLotteryDto.drawTime
          ? new Date(createLotteryDto.drawTime)
          : null,
        prizeDistribution: createLotteryDto.prizeDistribution as any,
        creatorId: userId,
      },
    });

    this.logger.log(`Created lottery in DRAFT status: ${lottery.id}`);

    // Check if payment is required (backward compatibility)
    const requiresPayment = user.role !== 'ADMIN'; // Admins bypass payment

    if (requiresPayment && createLotteryDto.paymentTxHash) {
      try {
        // Create transaction record
        const transaction = await this.transactionsService.createTransaction({
          type: TransactionType.LOTTERY_CREATION_FEE,
          fromAddress:
            createLotteryDto.paymentFromAddress || wallets[0].address,
          toAddress: this.verificationService.getPlatformFeeAddress(
            createLotteryDto.chainId,
          ),
          amount: this.verificationService.calculatePlatformFee(lottery.type),
          chainId: createLotteryDto.chainId,
          transactionHash: createLotteryDto.paymentTxHash,
          userId: userId,
          relatedId: lottery.id,
          metadata: { lotteryType: lottery.type },
        });

        // Queue verification
        await this.transactionQueue.add('verify-transaction', {
          transactionHash: createLotteryDto.paymentTxHash,
          chainId: createLotteryDto.chainId,
          expectedAmount: this.verificationService.calculatePlatformFee(
            lottery.type,
          ),
          expectedToAddress: this.verificationService.getPlatformFeeAddress(
            createLotteryDto.chainId,
          ),
          transactionId: transaction.id,
          lotteryId: lottery.id,
        });

        // Deploy the lottery
        await this.deployLottery(lottery.id);

        return this.findOne(lottery.id);
      } catch (error) {
        this.logger.error(`Payment processing failed: ${error.message}`);
        // Update lottery status back to DRAFT on failure
        await this.prisma.lottery.update({
          where: { id: lottery.id },
          data: { status: LotteryStatus.DRAFT },
        });
        throw error;
      }
    } else if (!requiresPayment || !createLotteryDto.paymentTxHash) {
      // For backward compatibility - allow deployment without payment for admins
      // or when payment is not provided
      try {
        await this.deployLottery(lottery.id);
        return this.findOne(lottery.id);
      } catch (error) {
        this.logger.error(`Deployment failed: ${error.message}`);
        return lottery;
      }
    } else {
      // Payment required but not provided
      throw new BadRequestException('Payment required for lottery creation');
    }
  }
  async getLotteryCreationFee(lotteryType: LotteryType, chainId: number) {
    const fee = this.verificationService.calculatePlatformFee(lotteryType);
    const platformAddress =
      this.verificationService.getPlatformFeeAddress(chainId);

    return {
      fee,
      platformAddress,
      chainId,
    };
  }

  async deployLottery(lotteryId: string) {
    const lottery = await this.prisma.lottery.findUnique({
      where: { id: lotteryId },
    });

    if (!lottery) {
      throw new NotFoundException(`Lottery with ID ${lotteryId} not found`);
    }

    if (lottery.status !== LotteryStatus.DRAFT) {
      throw new BadRequestException(`Lottery is not in DRAFT status`);
    }

    // Find creator's wallet for this chain
    const creatorWallets = await this.prisma.wallet.findMany({
      where: {
        userId: lottery.creatorId,
        chainId: lottery.chainId,
        isVerified: true,
      },
    });

    if (creatorWallets.length === 0) {
      throw new BadRequestException(
        `No verified wallet found for creator on chain ID ${lottery.chainId}`,
      );
    }

    // Update status to PENDING
    await this.prisma.lottery.update({
      where: { id: lotteryId },
      data: { status: LotteryStatus.PENDING },
    });

    // For testing purposes, we're using a hardcoded private key from Ganache
    // In production, you'd use a secure keystore or wallet signing
    // IMPORTANT: Never do this in production!
    const testPrivateKey =
      '0x18ffb44a672629dc52ffd261f400a415c8c6d0e1e612cef5f6511d8f4d02818f'; // first account from Ganache

    try {
      const deploymentResult = await this.blockchainService.deployLottery(
        lottery.chainId,
        lottery.tokenAddress,
        lottery.ticketPrice.toString(),
        lottery.maxTickets,
        lottery.minTickets,
        lottery.startTime,
        lottery.endTime,
        lottery.drawTime,
        lottery.prizeDistribution,
        creatorWallets[0].address,
        testPrivateKey,
      );

      // Update the lottery with contract address and status
      await this.prisma.lottery.update({
        where: { id: lotteryId },
        data: {
          contractAddress: deploymentResult.contractAddress,
          status: LotteryStatus.ACTIVE,
        },
      });

      this.logger.log(
        `Deployed lottery contract at ${deploymentResult.contractAddress}`,
      );

      return {
        contractAddress: deploymentResult.contractAddress,
        transactionHash: deploymentResult.transactionHash,
      };
    } catch (error) {
      // Update status back to DRAFT on failure
      await this.prisma.lottery.update({
        where: { id: lotteryId },
        data: { status: LotteryStatus.DRAFT },
      });

      this.logger.error(`Failed to deploy lottery: ${error.message}`);
      throw new Error(`Failed to deploy lottery: ${error.message}`);
    }
  }

  async findAll(
    params: {
      status?: LotteryStatus;
      chainId?: number;
      creatorId?: string;
    } = {},
  ) {
    return this.prisma.lottery.findMany({
      where: {
        status: params.status,
        chainId: params.chainId,
        creatorId: params.creatorId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const lottery = await this.prisma.lottery.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            profile: {
              select: {
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            tickets: true,
            winners: true,
          },
        },
      },
    });

    if (!lottery) {
      throw new NotFoundException(`Lottery with ID ${id} not found`);
    }

    return lottery;
  }

  // Additional methods for lottery management will be added here
  async handleLotteryDeployment(lotteryId: string, deploymentResult: any) {
    try {
      const lottery = await this.prisma.lottery.findUnique({
        where: { id: lotteryId },
      });

      if (!lottery) {
        this.logger.error(
          `Lottery not found for deployment update: ${lotteryId}`,
        );
        return;
      }

      await this.prisma.lottery.update({
        where: { id: lotteryId },
        data: {
          contractAddress: deploymentResult.contractAddress,
          status: LotteryStatus.ACTIVE,
        },
      });

      this.logger.log(
        `Updated lottery ${lotteryId} with contract address ${deploymentResult.contractAddress}`,
      );

      // Publish an event
      await this.rabbitMQService.publish('lottery.deployed', {
        lotteryId,
        contractAddress: deploymentResult.contractAddress,
      });
    } catch (error) {
      this.logger.error(
        `Failed to handle lottery deployment: ${error.message}`,
      );
    }
  }

  async deployLotteryAsync(lotteryId: string) {
    try {
      // First fetch the lottery without including the complex relations
      const lottery = await this.prisma.lottery.findUnique({
        where: { id: lotteryId },
      });

      if (!lottery) {
        throw new NotFoundException(`Lottery with ID ${lotteryId} not found`);
      }

      if (lottery.status !== LotteryStatus.DRAFT) {
        throw new BadRequestException(`Lottery is not in DRAFT status`);
      }

      // Now that we have the lottery, we can fetch creator's wallets in a separate query
      const creatorWallets = await this.prisma.wallet.findMany({
        where: {
          userId: lottery.creatorId,
          chainId: lottery.chainId,
          isVerified: true,
        },
      });

      if (creatorWallets.length === 0) {
        throw new BadRequestException(
          `No verified wallet found for creator on chain ID ${lottery.chainId}`,
        );
      }

      // Update status to PENDING
      await this.prisma.lottery.update({
        where: { id: lotteryId },
        data: { status: LotteryStatus.PENDING },
      });

      // Publish to RabbitMQ for async processing
      await this.rabbitMQService.publish('lottery.deploy', {
        lotteryId,
        chainId: lottery.chainId,
        tokenAddress: lottery.tokenAddress,
        creatorWalletAddress: creatorWallets[0].address,
        ticketPrice: lottery.ticketPrice.toString(),
        maxTickets: lottery.maxTickets,
        minTickets: lottery.minTickets,
        startTime: lottery.startTime,
        endTime: lottery.endTime,
        drawTime: lottery.drawTime,
        prizeDistribution: lottery.prizeDistribution,
        // Include all other necessary lottery details
      });

      // Track the deployment in Redis
      await this.trackDeploymentStatus(lotteryId, 'QUEUED', {
        queuedAt: new Date().toISOString(),
      });

      return { message: 'Lottery deployment queued' };
    } catch (error) {
      this.logger.error(`Failed to queue lottery deployment: ${error.message}`);
      throw error;
    }
  }

  async trackDeploymentStatus(
    lotteryId: string,
    status: string,
    details?: any,
  ) {
    const key = `lottery:deployment:${lotteryId}`;
    await this.redisService.set(
      key,
      {
        status,
        details,
        updatedAt: new Date().toISOString(),
      },
      60 * 60 * 24,
    ); // Store for 24 hours
  }

  // Add method to get deployment status
  async getDeploymentStatus(lotteryId: string) {
    const key = `lottery:deployment:${lotteryId}`;
    return this.redisService.get(key);
  }
}
