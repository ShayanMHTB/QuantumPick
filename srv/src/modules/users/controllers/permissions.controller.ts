import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermissions } from 'src/modules/auth/decorators/permissions.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/modules/auth/guards/permission.guard';
import {
  Permission,
  PERMISSION_THRESHOLDS,
} from '../entities/permissions.entity';
import { PermissionsService } from '../services/permissions.service';
import { UserMetricsService } from '../services/user-metrics.service';

@ApiTags('permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly userMetricsService: UserMetricsService,
  ) {}

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user permissions' })
  @ApiResponse({ status: 200, description: 'Returns user permissions' })
  async getMyPermissions(@Req() req) {
    return {
      permissions: await this.permissionsService.getUserPermissions(
        req.user.userId,
      ),
    };
  }

  @Get('check/:permission')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if current user has a specific permission' })
  @ApiResponse({ status: 200, description: 'Returns permission status' })
  async checkPermission(
    @Req() req,
    @Param('permission') permission: Permission,
  ) {
    return {
      permission,
      hasPermission: await this.permissionsService.hasPermission(
        req.user.userId,
        permission,
      ),
    };
  }

  // Admin endpoints for permission management
  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermissions(Permission.MANAGE_PLATFORM)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get permissions for a user (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns user permissions' })
  async getUserPermissions(@Param('userId') userId: string) {
    return {
      permissions: await this.permissionsService.getUserPermissions(userId),
    };
  }

  @Post('user/:userId/grant')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermissions(Permission.MANAGE_PLATFORM)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Grant permission to a user (Admin only)' })
  @ApiResponse({ status: 200, description: 'Permission granted' })
  async grantPermission(
    @Param('userId') userId: string,
    @Body()
    body: { permission: Permission; expiresAt?: string; metadata?: any },
    @Req() req,
  ) {
    await this.permissionsService.grantPermission(
      userId,
      body.permission,
      req.user.userId,
      body.expiresAt ? new Date(body.expiresAt) : undefined,
      body.metadata,
    );

    return { success: true };
  }

  @Delete('user/:userId/:permission')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermissions(Permission.MANAGE_PLATFORM)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke permission from a user (Admin only)' })
  @ApiResponse({ status: 200, description: 'Permission revoked' })
  async revokePermission(
    @Param('userId') userId: string,
    @Param('permission') permission: Permission,
  ) {
    await this.permissionsService.revokePermission(userId, permission);
    return { success: true };
  }

  // src/modules/users/controllers/permissions.controller.ts (additional method)
  @Get('eligibility/create-lottery')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check eligibility for lottery creation' })
  @ApiResponse({
    status: 200,
    description: 'Returns eligibility status and metrics',
  })
  async checkLotteryCreationEligibility(@Req() req) {
    const userId = req.user.userId;
    const hasPermission = await this.permissionsService.hasPermission(
      userId,
      Permission.CREATE_LOTTERY,
    );

    const metrics = await this.userMetricsService.getUserMetrics(userId);
    const threshold = PERMISSION_THRESHOLDS[Permission.CREATE_LOTTERY];

    return {
      eligible: hasPermission,
      metrics: metrics
        ? {
            ticketsPurchased: metrics.ticketsPurchased,
            amountSpent: metrics.amountSpent.toString(),
          }
        : { ticketsPurchased: 0, amountSpent: '0' },
      threshold: {
        minTicketsPurchased: threshold.minTicketsPurchased,
        minAmountSpent: threshold.minAmountSpent,
      },
      progress: metrics
        ? {
            ticketsPercentage: Math.min(
              100,
              (metrics.ticketsPurchased / threshold.minTicketsPurchased) * 100,
            ),
            spendingPercentage: Math.min(
              100,
              (Number(metrics.amountSpent) / threshold.minAmountSpent) * 100,
            ),
          }
        : { ticketsPercentage: 0, spendingPercentage: 0 },
    };
  }
}
