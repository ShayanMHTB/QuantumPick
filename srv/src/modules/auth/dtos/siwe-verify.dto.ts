import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SiweVerifyDto {
  @ApiProperty({ description: 'SIWE message' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ description: 'Signature of the SIWE message' })
  @IsString()
  @IsNotEmpty()
  signature: string;
}
