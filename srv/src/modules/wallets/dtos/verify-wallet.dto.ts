import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyWalletDto {
  @ApiProperty({ description: 'Wallet address to verify' })
  @IsString()
  @IsNotEmpty()
  address: string;
}
