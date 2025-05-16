import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class WalletForTicketDto {
  @ApiProperty({ description: 'Wallet ID to use for purchase' })
  @IsString()
  @IsNotEmpty()
  walletId: string;

  @ApiProperty({ description: 'Lottery ID to purchase ticket for' })
  @IsString()
  @IsNotEmpty()
  lotteryId: string;

  @ApiProperty({ description: 'Number of tickets to purchase' })
  @IsNumber()
  @IsNotEmpty()
  ticketCount: number;
}
