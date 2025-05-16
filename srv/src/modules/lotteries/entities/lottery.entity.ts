import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';

export enum LotteryStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  CLOSING = 'CLOSING',
  DRAWING = 'DRAWING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum LotteryType {
  STANDARD = 'STANDARD',
  PROGRESSIVE = 'PROGRESSIVE',
  FIXED_PRIZE = 'FIXED_PRIZE',
}

export class Lottery {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Lottery name' })
  name: string;

  @ApiProperty({ description: 'Lottery description', required: false })
  description?: string;

  @ApiProperty({ enum: LotteryType })
  type: LotteryType;

  @ApiProperty({ enum: LotteryStatus })
  status: LotteryStatus;

  @ApiProperty({ description: 'Blockchain network ID' })
  chainId: number;

  @ApiProperty({
    description: 'Deployed smart contract address',
    required: false,
  })
  contractAddress?: string;

  @ApiProperty({ description: 'Token contract address used for tickets' })
  tokenAddress: string;

  @ApiProperty({ description: 'Ticket price in token decimals' })
  ticketPrice: Decimal;

  @ApiProperty({ description: 'Maximum number of tickets', required: false })
  maxTickets?: number;

  @ApiProperty({
    description: 'Minimum number of tickets for valid draw',
    required: false,
  })
  minTickets?: number;

  @ApiProperty({ description: 'Start time' })
  startTime?: Date;

  @ApiProperty({ description: 'End time' })
  endTime?: Date;

  @ApiProperty({ description: 'Draw time' })
  drawTime?: Date;

  @ApiProperty({
    description: 'Transaction hash of the drawing',
    required: false,
  })
  drawTxHash?: string;

  @ApiProperty({ description: 'Prize distribution configuration' })
  prizeDistribution: any;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Creator user ID' })
  creatorId: string;
}
