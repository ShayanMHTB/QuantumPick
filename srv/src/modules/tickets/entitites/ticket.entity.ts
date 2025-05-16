import { ApiProperty } from '@nestjs/swagger';

export enum TicketStatus {
  PURCHASED = 'PURCHASED',
  WINNING = 'WINNING',
  LOSING = 'LOSING',
  REFUNDED = 'REFUNDED',
}

export class Ticket {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Lottery ID this ticket belongs to' })
  lotteryId: string;

  @ApiProperty({ description: 'User ID of the ticket owner' })
  userId: string;

  @ApiProperty({ description: 'Wallet address that purchased the ticket' })
  walletAddress: string;

  @ApiProperty({ description: 'Blockchain network ID' })
  chainId: number;

  @ApiProperty({ description: 'Ticket number in the lottery' })
  ticketNumber: number;

  @ApiProperty({ enum: TicketStatus, default: TicketStatus.PURCHASED })
  status: TicketStatus;

  @ApiProperty({ description: 'Transaction hash of the purchase' })
  purchaseTxHash: string;

  @ApiProperty({ description: 'Price paid for the ticket' })
  price: string;

  @ApiProperty({ description: 'Token used to purchase the ticket' })
  tokenAddress: string;

  @ApiProperty({
    description: 'Winning amount (if a winning ticket)',
    required: false,
  })
  winningAmount?: string;

  @ApiProperty({
    description: 'Transaction hash of the payout (if applicable)',
    required: false,
  })
  payoutTxHash?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
