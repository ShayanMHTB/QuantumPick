import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

export class Wallet implements Prisma.WalletUncheckedCreateInput {
  id?: string;
  address: string;
  chainId: number;
  isPrimary?: boolean;
  isVerified?: boolean;
  nickname?: string | null;
  createdAt?: Date | string;
  lastUsedAt?: Date | string;
  userId: string;

  // API properties for Swagger
  @ApiProperty({ description: 'Unique identifier' })
  get _id(): string | undefined {
    return this.id;
  }

  @ApiProperty({ description: 'Blockchain address' })
  get _address(): string {
    return this.address;
  }

  @ApiProperty({ description: 'Blockchain network ID' })
  get _chainId(): number {
    return this.chainId;
  }

  @ApiProperty({ description: 'Whether this is the primary wallet' })
  get _isPrimary(): boolean | undefined {
    return this.isPrimary;
  }

  @ApiProperty({ description: 'Whether this wallet is verified' })
  get _isVerified(): boolean | undefined {
    return this.isVerified;
  }

  @ApiProperty({ description: 'User-friendly name for the wallet' })
  get _nickname(): string | null | undefined {
    return this.nickname;
  }

  @ApiProperty({ description: 'When the wallet was added' })
  get _createdAt(): Date | string | undefined {
    return this.createdAt;
  }

  @ApiProperty({ description: 'When the wallet was last used' })
  get _lastUsedAt(): Date | string | undefined {
    return this.lastUsedAt;
  }

  @ApiProperty({ description: 'Owner user ID' })
  get _userId(): string {
    return this.userId;
  }
}
