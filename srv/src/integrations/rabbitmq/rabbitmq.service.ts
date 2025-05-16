import { Injectable, Logger } from '@nestjs/common';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class RabbitMQService {
  private readonly logger = new Logger(RabbitMQService.name);

  constructor(private readonly amqpConnection: AmqpConnection) {
    this.logger.log('RabbitMQ service initialized');
  }

  // Method to publish messages
  async publish(routingKey: string, message: any): Promise<void> {
    try {
      await this.amqpConnection.publish('quantum.pick.exchange', routingKey, {
        data: message,
        timestamp: new Date().toISOString(),
      });
      this.logger.debug(`Published message to ${routingKey}`);
    } catch (error) {
      this.logger.error(`Failed to publish message to ${routingKey}`, error);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: 'quantum.pick.exchange',
    routingKey: 'lottery.deploy',
    queue: 'lottery-deploy-queue',
  })
  async handleLotteryDeployment(message: any): Promise<void> {
    this.logger.debug(
      `Processing lottery deployment: ${JSON.stringify(message)}`,
    );

    // This would call your blockchain service to deploy the contract
    // For testing, you can just log the request
    this.logger.log(`Would deploy lottery contract for: ${message.lotteryId}`);

    // Publish a success message (in real impl, this would happen after actual deployment)
    await this.publish('lottery.deployed', {
      lotteryId: message.lotteryId,
      contractAddress: `0x${Array(40)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join('')}`,
      transactionHash: `0x${Array(64)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join('')}`,
    });
  }

  // Sample subscriber method
  @RabbitSubscribe({
    exchange: 'quantum.pick.exchange',
    routingKey: 'test.message',
    queue: 'test-message-queue',
  })
  async handleTestMessage(message: any): Promise<void> {
    this.logger.debug(`Received test message: ${JSON.stringify(message)}`);
    // Process the message here
  }
}
