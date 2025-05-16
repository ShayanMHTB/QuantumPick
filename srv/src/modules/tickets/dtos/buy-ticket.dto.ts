import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';

export class BuyTicketDto {
  @ApiProperty({ description: 'Lottery ID' })
  @IsString()
  @IsNotEmpty()
  lotteryId: string;

  @ApiProperty({ description: 'Number of tickets to purchase', example: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Wallet address to use for purchase',
    required: false,
  })
  @IsString()
  @IsOptional()
  walletAddress?: string; // If not provided, use the user's primary wallet for the chain
}
