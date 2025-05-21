import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma/prisma.service';
import {
  Permission,
  ROLE_PERMISSIONS,
  PERMISSION_THRESHOLDS,
} from '../entities/permissions.entity';
import { UserRole } from '../entities/user.entity';

@Injectable()
export class PermissionsService {
  private readonly logger = new Logger(PermissionsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Check if a user has a specific permission
   */
  async hasPermission(
    userId: string,
    permission: Permission,
  ): Promise<boolean> {
    try {
      // First check if the user has an explicit permission record
      const permissionRecord = await this.prisma.userPermission.findUnique({
        where: {
          userId_permission: {
            userId,
            permission,
          },
        },
      });

      if (permissionRecord) {
        // Check if permission has expired
        if (
          permissionRecord.expiresAt &&
          permissionRecord.expiresAt < new Date()
        ) {
          return false;
        }
        return true;
      }

      // If no explicit permission, check role-based permissions
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return false;
      }

      return ROLE_PERMISSIONS[user.role]?.includes(permission) || false;
    } catch (error) {
      this.logger.error(`Error checking permission: ${error.message}`);
      return false;
    }
  }

  /**
   * Get all permissions for a user (both explicit and role-based)
   */
  async getUserPermissions(userId: string): Promise<Permission[]> {
    try {
      // Get user with role
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          permissions: {
            where: {
              OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            },
          },
        },
      });

      if (!user) {
        return [];
      }

      // Get role-based permissions
      const rolePermissions = ROLE_PERMISSIONS[user.role] || [];

      // Get explicit permissions
      const explicitPermissions = user.permissions.map(
        (p) => p.permission as Permission,
      );

      // Combine and deduplicate
      return [...new Set([...rolePermissions, ...explicitPermissions])];
    } catch (error) {
      this.logger.error(`Error getting user permissions: ${error.message}`);
      return [];
    }
  }

  /**
   * Grant a specific permission to a user
   */
  async grantPermission(
    userId: string,
    permission: Permission,
    grantedById?: string,
    expiresAt?: Date,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      await this.prisma.userPermission.upsert({
        where: {
          userId_permission: {
            userId,
            permission,
          },
        },
        update: {
          grantedById,
          expiresAt,
          metadata,
        },
        create: {
          userId,
          permission,
          grantedById,
          expiresAt,
          metadata,
        },
      });
    } catch (error) {
      this.logger.error(`Error granting permission: ${error.message}`);
      throw error;
    }
  }

  /**
   * Revoke a specific permission from a user
   */
  async revokePermission(
    userId: string,
    permission: Permission,
  ): Promise<void> {
    try {
      await this.prisma.userPermission.delete({
        where: {
          userId_permission: {
            userId,
            permission,
          },
        },
      });
    } catch (error) {
      this.logger.error(`Error revoking permission: ${error.message}`);
      // If permission doesn't exist, that's fine
      if (!error.message.includes('Record to delete does not exist')) {
        throw error;
      }
    }
  }

  /**
   * Check and update permissions based on user metrics
   */
  async evaluatePermissions(userId: string): Promise<void> {
    try {
      // Get user metrics
      const metrics = await this.prisma.userMetrics.findUnique({
        where: { userId },
      });

      if (!metrics) {
        return;
      }

      // Check each permission threshold
      for (const [permission, threshold] of Object.entries(
        PERMISSION_THRESHOLDS,
      )) {
        // Convert Decimal to number for comparison
        const amountSpent = parseFloat(metrics.amountSpent.toString());

        const meetsThreshold =
          metrics.ticketsPurchased >= threshold.minTicketsPurchased &&
          amountSpent >= threshold.minAmountSpent;

        if (meetsThreshold) {
          // Grant the permission if threshold is met
          await this.grantPermission(
            userId,
            permission as Permission,
            null, // System granted
            null, // No expiration
            { reason: 'threshold_met', thresholdData: threshold },
          );

          this.logger.log(
            `Auto-granted ${permission} to user ${userId} based on metrics`,
          );
        }
      }
    } catch (error) {
      this.logger.error(`Error evaluating permissions: ${error.message}`);
    }
  }
}
