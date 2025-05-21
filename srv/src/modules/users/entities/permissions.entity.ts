import { ApiProperty } from '@nestjs/swagger';

export enum Permission {
  CREATE_LOTTERY = 'CREATE_LOTTERY',
  EDIT_LOTTERY = 'EDIT_LOTTERY',
  VIEW_ADMIN_DASHBOARD = 'VIEW_ADMIN_DASHBOARD',
  MODERATE_USERS = 'MODERATE_USERS',
  MANAGE_PLATFORM = 'MANAGE_PLATFORM',
}

// Role to permission mapping - could also be stored in a service
export const ROLE_PERMISSIONS = {
  ADMIN: [
    Permission.CREATE_LOTTERY,
    Permission.EDIT_LOTTERY,
    Permission.VIEW_ADMIN_DASHBOARD,
    Permission.MODERATE_USERS,
    Permission.MANAGE_PLATFORM,
  ],
  MODERATOR: [Permission.MODERATE_USERS, Permission.VIEW_ADMIN_DASHBOARD],
  PREMIUM: [Permission.CREATE_LOTTERY],
  CREATOR: [Permission.CREATE_LOTTERY],
  USER: [],
};

// Thresholds for automatic permission grants
export const PERMISSION_THRESHOLDS = {
  [Permission.CREATE_LOTTERY]: {
    minTicketsPurchased: 10,
    minAmountSpent: 50, // In base currency (e.g., USD)
  },
};

// Permission entity class for ORM/API purposes
export class PermissionEntity {
  @ApiProperty({ description: 'Permission name', enum: Permission })
  permission: Permission;

  @ApiProperty({ description: 'When the permission was granted' })
  grantedAt: Date;

  @ApiProperty({ description: 'When the permission expires (if applicable)' })
  expiresAt?: Date;

  @ApiProperty({ description: 'Who granted this permission' })
  grantedById?: string;

  @ApiProperty({ description: 'Additional permission metadata' })
  metadata?: Record<string, any>;
}
