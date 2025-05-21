import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/integrations/prisma/prisma.service';
import { RabbitMQService } from 'src/integrations/rabbitmq/rabbitmq.service';

@Injectable()
export class PermissionCronService {
  private readonly logger = new Logger(PermissionCronService.name);

  constructor(
    private prisma: PrismaService,
    private rabbitMQService: RabbitMQService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async evaluateUserPermissions() {
    this.logger.log('Starting daily permission evaluation');

    try {
      // Get all active users
      const users = await this.prisma.user.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true },
      });

      this.logger.log(
        `Found ${users.length} active users for permission evaluation`,
      );

      // Queue permission evaluation for each user
      for (const user of users) {
        await this.rabbitMQService.publish('user.evaluate_permissions', {
          userId: user.id,
        });
      }

      this.logger.log('Permission evaluation jobs queued successfully');
    } catch (error) {
      this.logger.error(
        `Error scheduling permission evaluations: ${error.message}`,
      );
    }
  }
}
