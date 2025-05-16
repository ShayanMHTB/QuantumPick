import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma/prisma.service';
import { RabbitMQService } from 'src/integrations/rabbitmq/rabbitmq.service';
import { RedisService } from 'src/integrations/redis/redis.service';
import { BlockchainsService } from 'src/modules/blockchains/services/blockchains.service';
import { BlockchainsMockService } from '../../blockchains/services/blockchains.mock.service';
import { LotteryStatus } from '../../lotteries/entities/lottery.entity';
import { WalletsService } from '../../wallets/services/wallets.service';
import { BuyTicketDto } from '../dtos/buy-ticket.dto';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    private prisma: PrismaService,
    @Inject('BLOCKCHAIN_SERVICE')
    private blockchainService: BlockchainsService | BlockchainsMockService,
    private walletsService: WalletsService,
    private rabbitMQService: RabbitMQService,
    private redisService: RedisService,
  ) {}

  // The rest of your service remains unchanged...
  // Only the constructor changes to use the injected service

  async buyTicket(buyTicketDto: BuyTicketDto, userId: string) {
    // Validate the lottery exists and is active
    const lottery = await this.prisma.lottery.findUnique({
      where: { id: buyTicketDto.lotteryId },
    });

    if (!lottery) {
      throw new NotFoundException(
        `Lottery with ID ${buyTicketDto.lotteryId} not found`,
      );
    }

    if (lottery.status !== LotteryStatus.ACTIVE) {
      throw new BadRequestException(
        `Lottery is not active. Current status: ${lottery.status}`,
      );
    }

    if (!lottery.contractAddress) {
      throw new BadRequestException('Lottery contract not deployed');
    }

    // Check lottery time constraints
    const now = new Date();
    if (lottery.startTime && new Date(lottery.startTime) > now) {
      throw new BadRequestException('Lottery has not started yet');
    }

    if (lottery.endTime && new Date(lottery.endTime) < now) {
      throw new BadRequestException(
        'Lottery is already closed for ticket purchases',
      );
    }

    // Check max tickets constraint
    if (lottery.maxTickets) {
      const ticketCount = await this.prisma.ticket.count({
        where: { lotteryId: lottery.id },
      });

      if (ticketCount + buyTicketDto.quantity > lottery.maxTickets) {
        throw new BadRequestException(
          `Purchase would exceed maximum ticket limit of ${lottery.maxTickets}`,
        );
      }
    }

    // Get or validate user's wallet
    let wallet;
    if (buyTicketDto.walletAddress) {
      // Verify the wallet belongs to the user
      wallet = await this.prisma.wallet.findFirst({
        where: {
          userId,
          address: buyTicketDto.walletAddress,
          chainId: lottery.chainId,
          isVerified: true,
        },
      });

      if (!wallet) {
        throw new BadRequestException(
          'The specified wallet is not verified or does not belong to you',
        );
      }
    } else {
      // Get the user's primary wallet for this chain
      wallet = await this.prisma.wallet.findFirst({
        where: {
          userId,
          chainId: lottery.chainId,
          isVerified: true,
        },
        orderBy: { isPrimary: 'desc' },
      });

      if (!wallet) {
        throw new BadRequestException(
          `No verified wallet found for chain ID ${lottery.chainId}`,
        );
      }
    }

    // Check if the user can buy tickets (has sufficient balance and allowance)
    const canBuy = await this.blockchainService.canBuyTickets(
      lottery.contractAddress,
      lottery.chainId,
      wallet.address,
      buyTicketDto.quantity,
    );

    if (!canBuy.canBuy) {
      throw new BadRequestException(`Cannot buy tickets: ${canBuy.reason}`);
    }

    // In a real implementation, we would not store private keys
    // Instead, we would use a secure keystore or require the user to sign the transaction
    // For development purposes, we're using hardcoded keys from Hardhat
    const privateKey = process.env.USER_WALLET_PRIVATE_KEY;

    if (!privateKey) {
      throw new BadRequestException(
        'No wallet private key available for testing',
      );
    }

    try {
      // Queue the purchase transaction
      const purchaseId = `${userId}-${lottery.id}-${Date.now()}`;
      await this.redisService.set(`ticket:purchase:${purchaseId}`, {
        status: 'PENDING',
        lotteryId: lottery.id,
        userId,
        walletAddress: wallet.address,
        quantity: buyTicketDto.quantity,
        timestamp: new Date().toISOString(),
      });

      // Publish to RabbitMQ for async processing
      await this.rabbitMQService.publish('ticket.purchase', {
        purchaseId,
        lotteryId: lottery.id,
        userId,
        walletAddress: wallet.address,
        chainId: lottery.chainId,
        contractAddress: lottery.contractAddress,
        quantity: buyTicketDto.quantity,
        privateKey, // Warning: In production, never pass private keys directly
      });

      return {
        message: 'Ticket purchase initiated',
        purchaseId,
        lotteryId: lottery.id,
        quantity: buyTicketDto.quantity,
        walletAddress: wallet.address,
      };
    } catch (error) {
      this.logger.error(`Failed to initiate ticket purchase: ${error.message}`);
      throw new BadRequestException(
        `Failed to initiate ticket purchase: ${error.message}`,
      );
    }
  }

  async getPurchaseStatus(purchaseId: string) {
    return this.redisService.get(`ticket:purchase:${purchaseId}`);
  }

  async getUserTickets(userId: string, lotteryId?: string) {
    return this.prisma.ticket.findMany({
      where: {
        purchaserId: userId,
        ...(lotteryId ? { lotteryId } : {}),
      },
      orderBy: { purchasedAt: 'desc' },
    });
  }

  async getTicketById(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        lottery: {
          select: {
            name: true,
            contractAddress: true,
            status: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    return ticket;
  }

  // This method would be called by the blockchain event listener when a ticket purchase is detected
  async handleTicketPurchaseEvent(event: any) {
    try {
      // Extract purchase details from the event
      const { lotteryId, buyer, ticketId, quantity, transactionHash } = event;

      // Find the user associated with the wallet address
      const wallet = await this.prisma.wallet.findFirst({
        where: {
          address: buyer,
          isVerified: true,
        },
      });

      if (!wallet) {
        this.logger.warn(`No wallet found for address ${buyer}`);
        return;
      }

      // Get the lottery
      const lottery = await this.prisma.lottery.findUnique({
        where: { id: lotteryId },
      });

      if (!lottery) {
        this.logger.warn(`Lottery ${lotteryId} not found`);
        return;
      }

      // Create ticket records
      const tickets = [];

      for (let i = 0; i < parseInt(quantity); i++) {
        const ticketNumber = parseInt(ticketId) + i;

        // Create ticket record
        const ticket = await this.prisma.ticket.create({
          data: {
            lotteryId,
            purchaserId: wallet.userId,
            walletId: wallet.id,
            ticketNumber,
            txHash: transactionHash,
          },
        });

        tickets.push(ticket);
      }

      this.logger.log(
        `Created ${tickets.length} tickets for user ${wallet.userId}`,
      );

      // Update the purchase status in Redis if it exists
      const purchaseKeys = await this.redisService.getAllKeys();
      const purchaseKey = purchaseKeys.find(
        (key) =>
          key.startsWith('ticket:purchase:') &&
          key.includes(wallet.userId) &&
          key.includes(lotteryId),
      );

      if (purchaseKey) {
        await this.redisService.set(purchaseKey, {
          status: 'COMPLETED',
          lotteryId,
          userId: wallet.userId,
          walletAddress: buyer,
          quantity: parseInt(quantity),
          ticketNumbers: tickets.map((t) => t.ticketNumber),
          transactionHash,
          completedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      this.logger.error(
        `Failed to handle ticket purchase event: ${error.message}`,
      );
    }
  }

  // Method to handle winning tickets
  async handleWinningTickets(
    lotteryId: string,
    winningNumbers: number[],
    payoutTxHash: string,
  ) {
    try {
      // Get the lottery
      const lottery = await this.prisma.lottery.findUnique({
        where: { id: lotteryId },
      });

      if (!lottery) {
        throw new Error(`Lottery ${lotteryId} not found`);
      }

      // Update tickets based on winning numbers
      for (const winningNumber of winningNumbers) {
        // Find the ticket with this number
        const ticket = await this.prisma.ticket.findFirst({
          where: {
            lotteryId,
            ticketNumber: winningNumber,
          },
        });

        if (ticket) {
          // Calculate prize amount based on position
          let prizePercentage = 0;
          const position = winningNumbers.indexOf(winningNumber);
          const distribution = lottery.prizeDistribution as any;

          if (position === 0) {
            prizePercentage = distribution.first || 0;
          } else if (position === 1) {
            prizePercentage = distribution.second || 0;
          } else if (position === 2) {
            prizePercentage = distribution.third || 0;
          }

          // Get total pot size from ticket count and price
          const ticketCount = await this.prisma.ticket.count({
            where: { lotteryId },
          });

          const totalPot =
            parseFloat(lottery.ticketPrice.toString()) * ticketCount;
          const winningAmount = (totalPot * prizePercentage) / 100;

          // Update ticket as winning
          await this.prisma.lotteryWinner.create({
            data: {
              lotteryId,
              ticketId: ticket.id,
              prizeRank: position + 1,
              prizeAmount: winningAmount,
            },
          });

          this.logger.log(
            `Updated ticket ${ticket.id} as winning ${winningAmount} tokens`,
          );

          // Publish winning event
          await this.rabbitMQService.publish('ticket.winning', {
            ticketId: ticket.id,
            lotteryId,
            userId: ticket.purchaserId,
            position: position + 1,
            percentage: prizePercentage,
            amount: winningAmount,
            payoutTxHash,
          });
        }
      }

      this.logger.log(
        `Updated remaining tickets for lottery ${lotteryId} as losing`,
      );
    } catch (error) {
      this.logger.error(`Failed to handle winning tickets: ${error.message}`);
      throw error;
    }
  }

  async getTicketStatus(ticketId: string): Promise<string> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        winner: true, // Include winner relation
        lottery: true, // Include lottery relation for status check
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }

    // Check if ticket is a winner
    if (ticket.winner) {
      return 'WINNING';
    }

    // Check if lottery is cancelled (for refunded status)
    if (ticket.lottery.status === LotteryStatus.CANCELLED) {
      return 'REFUNDED';
    }

    // Check if lottery is completed with no prize for this ticket
    if (ticket.lottery.status === LotteryStatus.COMPLETED) {
      return 'LOSING';
    }

    // Default state
    return 'PURCHASED';
  }
}
