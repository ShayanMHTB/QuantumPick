// src/modules/auth/decorators/permissions.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Permission } from 'src/modules/users/entities/permissions.entity';

export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata('permissions', permissions);
