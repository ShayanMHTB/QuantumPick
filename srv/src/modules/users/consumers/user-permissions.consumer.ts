import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { PermissionsService } from '../services/permissions.service';
import { UserMetricsService } from '../services/user-metrics.service';

@Injectable()
export class UserPermissionsConsumer {
  private readonly logger = new Logger(UserPermissionsConsumer.name);

  constructor(
    private permissionsService: PermissionsService,
    private userMetricsService: UserMetricsService,
  ) {}

  @RabbitSubscribe({
    exchange: 'quantum.pick.exchange',
    routingKey: 'ticket.purchased',
    queue: 'user-metrics-queue',
  })
  async handleTicketPurchase(message: any): Promise<void> {
    const { userId, quantity, amount } = message;
    this.logger.log(`Processing ticket purchase for user ${userId}`);

    try {
      await this.userMetricsService.recordTicketPurchase(
        userId,
        quantity,
        amount,
      );
      this.logger.log(`Updated metrics for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to process ticket purchase: ${error.message}`);
    }
  }

  @RabbitSubscribe({
    exchange: 'quantum.pick.exchange',
    routingKey: 'user.evaluate_permissions',
    queue: 'permission-evaluation-queue',
  })
  async handlePermissionEvaluation(message: any): Promise<void> {
    const { userId } = message;
    this.logger.log(`Evaluating permissions for user ${userId}`);

    try {
      await this.permissionsService.evaluatePermissions(userId);
      this.logger.log(`Evaluated permissions for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to evaluate permissions: ${error.message}`);
    }
  }
}
