import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { TransactionType } from '@prisma/client';

export class CreatePaymentDto {
  @IsString()
  transactionHash: string;

  @IsString()
  fromAddress: string;

  @IsString()
  toAddress: string;

  @IsString()
  amount: string;

  @IsNumber()
  chainId: number;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsString()
  @IsOptional()
  relatedId?: string;

  @IsOptional()
  metadata?: any;
}

export class VerifyPaymentDto {
  @IsString()
  transactionHash: string;

  @IsNumber()
  chainId: number;

  @IsString()
  expectedAmount: string;

  @IsString()
  expectedToAddress: string;
}
