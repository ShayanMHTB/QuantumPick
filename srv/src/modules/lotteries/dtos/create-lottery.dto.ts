import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { LotteryType } from '../entities/lottery.entity';

class PrizeDistribution {
  @ApiProperty({
    description: 'Percentage of prize pool for first place',
    example: 70,
  })
  @IsNumber()
  @Min(0)
  first: number;

  @ApiProperty({
    description: 'Percentage of prize pool for second place',
    example: 20,
  })
  @IsNumber()
  @Min(0)
  second: number;

  @ApiProperty({
    description: 'Percentage of prize pool for third place',
    example: 10,
  })
  @IsNumber()
  @Min(0)
  third: number;
}

export class CreateLotteryDto {
  @ApiProperty({
    description: 'Lottery template ID',
    example: 'basic',
    enum: ['basic', 'medium', 'mega'],
  })
  @IsString()
  @IsNotEmpty()
  templateId: string;

  @ApiProperty({ description: 'Lottery name', example: 'Weekly Jackpot' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Lottery description',
    example: 'Win big in our weekly draw!',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Blockchain network ID', example: 1 })
  @IsInt()
  chainId: number;

  @ApiProperty({
    description: 'Token contract address (e.g., USDC)',
    example: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  })
  @IsString()
  @IsNotEmpty()
  tokenAddress: string;

  @ApiProperty({ description: 'Ticket price in token decimals', example: 5 })
  @IsNumber()
  @Min(0)
  ticketPrice: number;

  @ApiProperty({
    description: 'Prize pool target',
    example: 5000,
  })
  @IsNumber()
  @Min(0)
  prizePool: number;

  @ApiProperty({
    description: 'Start time (ISO8601)',
    example: '2025-06-01T00:00:00Z',
    required: false,
  })
  @IsISO8601()
  @IsOptional()
  startTime?: string;

  @ApiProperty({
    description: 'End time (ISO8601)',
    example: '2025-06-07T23:59:59Z',
    required: false,
  })
  @IsISO8601()
  @IsOptional()
  endTime?: string;

  @ApiProperty({
    description: 'Draw time (ISO8601)',
    example: '2025-06-08T12:00:00Z',
    required: false,
  })
  @IsISO8601()
  @IsOptional()
  drawTime?: string;

  @ApiProperty({ type: PrizeDistribution })
  @IsObject()
  @ValidateNested()
  @Type(() => PrizeDistribution)
  prizeDistribution: PrizeDistribution;

  @ApiProperty({ description: 'Payment transaction hash', required: false })
  @IsString()
  @IsOptional()
  paymentTxHash?: string;

  @ApiProperty({ description: 'Payment from address', required: false })
  @IsString()
  @IsOptional()
  paymentFromAddress?: string;
}
