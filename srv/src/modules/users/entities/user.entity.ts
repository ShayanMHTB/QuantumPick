import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

// Manually define the enums since they're from the schema
export enum UserRole {
  USER = 'USER',
  CREATOR = 'CREATOR',
  PREMIUM = 'PREMIUM',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
}

export enum AuthSource {
  WEB3 = 'WEB3',
  TRADITIONAL = 'TRADITIONAL',
  BOTH = 'BOTH',
}

// Define the User entity
export class User implements Prisma.UserUncheckedCreateInput {
  id?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  email?: string | null;
  hashedPassword?: string | null;
  role?: UserRole;
  status?: UserStatus;
  authSource?: AuthSource;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string | null;
  lastLoginAt?: Date | string | null;

  // These are for relations and aren't directly part of the entity
  wallets?: Prisma.WalletUncheckedCreateNestedManyWithoutUserInput;
  profile?: Prisma.UserProfileUncheckedCreateNestedOneWithoutUserInput;
  permissions?: Prisma.UserPermissionUncheckedCreateNestedManyWithoutUserInput;
  subscription?: Prisma.UserSubscriptionUncheckedCreateNestedOneWithoutUserInput;
  // Add API properties for Swagger
  @ApiProperty({ description: 'Unique identifier' })
  get _id(): string | undefined {
    return this.id;
  }

  @ApiProperty({ description: 'When the user was created' })
  get _createdAt(): Date | string | undefined {
    return this.createdAt;
  }

  @ApiProperty({ description: 'When the user was last updated' })
  get _updatedAt(): Date | string | undefined {
    return this.updatedAt;
  }

  @ApiProperty({
    description: 'Email address',
    required: false,
    nullable: true,
  })
  get _email(): string | null | undefined {
    return this.email;
  }

  @ApiProperty({
    description: 'Hashed password',
    required: false,
    nullable: true,
    readOnly: true,
  })
  get _hashedPassword(): string | null | undefined {
    return this.hashedPassword;
  }

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    default: UserRole.USER,
  })
  get _role(): UserRole | undefined {
    return this.role;
  }

  @ApiProperty({
    description: 'User status',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  get _status(): UserStatus | undefined {
    return this.status;
  }

  @ApiProperty({
    description: 'Authentication source',
    enum: AuthSource,
    default: AuthSource.WEB3,
  })
  get _authSource(): AuthSource | undefined {
    return this.authSource;
  }

  @ApiProperty({
    description: 'Whether two-factor authentication is enabled',
    default: false,
  })
  get _twoFactorEnabled(): boolean | undefined {
    return this.twoFactorEnabled;
  }

  @ApiProperty({
    description: 'Two-factor authentication secret',
    required: false,
    nullable: true,
    readOnly: true,
  })
  get _twoFactorSecret(): string | null | undefined {
    return this.twoFactorSecret;
  }

  @ApiProperty({
    description: 'Last login timestamp',
    required: false,
    nullable: true,
  })
  get _lastLoginAt(): Date | string | null | undefined {
    return this.lastLoginAt;
  }
}
