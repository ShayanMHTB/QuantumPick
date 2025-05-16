import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsObject, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ description: 'Display name', required: false })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  displayName?: string;

  @ApiProperty({ description: 'Avatar URL', required: false })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiProperty({ description: 'User bio', required: false })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  bio?: string;

  @ApiProperty({
    description: 'Social media links',
    required: false,
    type: Object,
  })
  @IsObject()
  @IsOptional()
  socialLinks?: Record<string, string>;

  @ApiProperty({
    description: 'User preferences',
    required: false,
    type: Object,
  })
  @IsObject()
  @IsOptional()
  preferences?: Record<string, any>;
}
