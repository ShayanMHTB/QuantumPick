import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  MinLength,
  IsEnum,
} from 'class-validator';
import { UserRole, AuthSource } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', required: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ required: true, minLength: 8 })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ 
    required: false, 
    enum: UserRole,
    default: UserRole.USER 
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ 
    required: false, 
    enum: AuthSource,
    default: AuthSource.TRADITIONAL 
  })
  @IsEnum(AuthSource)
  @IsOptional()
  authSource?: AuthSource;

  // Profile fields
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  displayName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bio?: string;
}
