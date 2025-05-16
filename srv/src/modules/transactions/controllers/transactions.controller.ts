import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { TransactionsService } from '../services/transactions.service';
import { TransactionType } from '@prisma/client';

@ApiTags('transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user transactions' })
  async getUserTransactions(
    @Query('type') type?: TransactionType,
    @Query('userId') userId?: string, // Admin can query any user
  ) {
    // In a real app, you'd check permissions here
    return this.transactionsService.getUserTransactions(
      userId || 'current-user-id',
      type,
    );
  }

  @Get(':hash')
  @ApiOperation({ summary: 'Get transaction by hash' })
  async getTransactionByHash(@Param('hash') hash: string) {
    return this.transactionsService.getTransactionByHash(hash);
  }

  @Get('verify/:hash')
  @ApiOperation({ summary: 'Verify transaction status' })
  async verifyTransaction(@Param('hash') hash: string) {
    // This would trigger verification logic
    const tx = await this.transactionsService.getTransactionByHash(hash);
    return { transaction: tx, status: tx?.status };
  }
}
