import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PrismaService } from 'src/integrations/prisma/prisma.service';
import { RedisService } from 'src/integrations/redis/redis.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@ApiTags('testing')
@Controller('testing/tickets')
export class TestingTicketsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  @Post('buy')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Buy tickets for testing (without blockchain checks)',
  })
  @ApiResponse({ status: 201, description: 'Ticket purchase initiated' })
  async buyTicketsForTesting(
    @Body()
    buyTicketDto: {
      lotteryId: string;
      quantity: number;
      walletAddress?: string;
    },
    @Req() req,
  ) {
    const userId = req.user.userId;

    // Validate the lottery exists
    const lottery = await this.prisma.lottery.findUnique({
      where: { id: buyTicketDto.lotteryId },
    });

    if (!lottery) {
      throw new Error(`Lottery with ID ${buyTicketDto.lotteryId} not found`);
    }

    // Get or validate user's wallet
    let wallet;
    if (buyTicketDto.walletAddress) {
      // Use the specified wallet
      wallet = await this.prisma.wallet.findFirst({
        where: {
          userId,
          address: buyTicketDto.walletAddress,
        },
      });

      if (!wallet) {
        // Create a test wallet if it doesn't exist
        wallet = await this.prisma.wallet.create({
          data: {
            userId,
            address: buyTicketDto.walletAddress,
            chainId: lottery.chainId,
            isPrimary: false,
            isVerified: true,
          },
        });
      }
    } else {
      // Get the user's primary wallet or create one
      wallet = await this.prisma.wallet.findFirst({
        where: {
          userId,
          chainId: lottery.chainId,
        },
        orderBy: { isPrimary: 'desc' },
      });

      if (!wallet) {
        // Create a test wallet with a random address
        const address = `0x${Array(40)
          .fill(0)
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join('')}`;

        wallet = await this.prisma.wallet.create({
          data: {
            userId,
            address,
            chainId: lottery.chainId,
            isPrimary: true,
            isVerified: true,
          },
        });
      }
    }

    // Generate a purchase ID
    const purchaseId = `test-${userId}-${lottery.id}-${Date.now()}`;

    // Store purchase info in Redis
    await this.redisService.set(`ticket:purchase:${purchaseId}`, {
      status: 'PENDING',
      lotteryId: lottery.id,
      userId,
      walletId: wallet.id,
      walletAddress: wallet.address,
      quantity: buyTicketDto.quantity,
      timestamp: new Date().toISOString(),
    });

    // Create tickets directly (no blockchain interaction)
    const ticketNumbers = [];
    const txHash = `0x${Array(64)
      .fill(0)
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('')}`;

    // Get current max ticket number for this lottery
    const maxTicket = await this.prisma.ticket.findFirst({
      where: { lotteryId: lottery.id },
      orderBy: { ticketNumber: 'desc' },
    });

    const startNumber = maxTicket ? maxTicket.ticketNumber + 1 : 1;

    // Create ticket records
    for (let i = 0; i < buyTicketDto.quantity; i++) {
      const ticketNumber = startNumber + i;
      ticketNumbers.push(ticketNumber);

      await this.prisma.ticket.create({
        data: {
          lotteryId: lottery.id,
          purchaserId: userId,
          walletId: wallet.id,
          ticketNumber,
          txHash,
        },
      });
    }

    // Update purchase status to COMPLETED
    await this.redisService.set(`ticket:purchase:${purchaseId}`, {
      status: 'COMPLETED',
      lotteryId: lottery.id,
      userId,
      walletId: wallet.id,
      walletAddress: wallet.address,
      quantity: buyTicketDto.quantity,
      ticketNumbers,
      transactionHash: txHash,
      timestamp: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });

    return {
      message: 'Tickets purchased successfully',
      purchaseId,
      lotteryId: lottery.id,
      quantity: buyTicketDto.quantity,
      walletAddress: wallet.address,
      ticketNumbers,
      transactionHash: txHash,
    };
  }
}
