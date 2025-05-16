import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PrismaService } from 'src/integrations/prisma/prisma.service';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { UserRole } from 'src/modules/users/entities/user.entity';

@ApiTags('testing')
@Controller('testing/lotteries')
export class TestingLotteriesController {
  constructor(private readonly prisma: PrismaService) {}

  @Post(':id/set-times')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update lottery times for testing (Admin only)' })
  @ApiResponse({ status: 200, description: 'Lottery times updated' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Lottery not found' })
  async updateLotteryTimes(
    @Param('id') id: string,
    @Body()
    updateTimesDto: {
      startTime?: string;
      endTime?: string;
      drawTime?: string;
    } = {},
  ) {
    // Calculate dates relative to now if needed
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfterTomorrow = new Date(now);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    // Update the lottery with new times
    const updatedLottery = await this.prisma.lottery.update({
      where: { id },
      data: {
        startTime: updateTimesDto.startTime
          ? new Date(updateTimesDto.startTime)
          : // Default to 1 hour ago if not provided
            new Date(now.getTime() - 60 * 60 * 1000),

        endTime: updateTimesDto.endTime
          ? new Date(updateTimesDto.endTime)
          : // Default to tomorrow if not provided
            new Date(now.getTime() + 10 * 2 * 60 * 1000),

        drawTime: updateTimesDto.drawTime
          ? new Date(updateTimesDto.drawTime)
          : // Default to day after tomorrow if not provided
            dayAfterTomorrow,
      },
    });

    return {
      message: 'Lottery times updated for testing',
      lottery: {
        id: updatedLottery.id,
        name: updatedLottery.name,
        startTime: updatedLottery.startTime,
        endTime: updatedLottery.endTime,
        drawTime: updatedLottery.drawTime,
        status: updatedLottery.status,
      },
    };
  }
}
