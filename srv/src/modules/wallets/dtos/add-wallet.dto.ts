import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class AddWalletDto {
  @ApiProperty({ description: 'Wallet address' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ description: 'Chain ID' })
  @IsNumber()
  chainId: number;

  @ApiProperty({ description: 'Wallet nickname', required: false })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiProperty({
    description: 'SIWE message signature proving ownership',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  signature: string;

  @ApiProperty({ description: 'SIWE message that was signed', required: true })
  @IsString()
  @IsNotEmpty()
  message: string;
}
