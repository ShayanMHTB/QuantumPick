import { Module, Global } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RabbitMQService } from './rabbitmq.service';

@Global()
@Module({
  imports: [
    RabbitMQModule.forRoot({
      exchanges: [
        {
          name: 'quantum.pick.exchange',
          type: 'topic',
        },
      ],
      uri: `amqp://${process.env.RABBITMQ_USER || 'guest'}:${
        process.env.RABBITMQ_PASSWORD || 'guest'
      }@localhost:${
        // Use localhost instead of rabbitmq service name
        process.env.HOST_RABBITMQ_PORT || 5672 // Use HOST port, not internal
      }/${encodeURIComponent(process.env.RABBITMQ_VHOST || '/')}`,
      connectionInitOptions: { wait: false, timeout: 30000 },
      enableControllerDiscovery: true,
    }),
  ],
  providers: [RabbitMQService],
  exports: [RabbitMQService],
  controllers: [],
})
export class RabbitMQConfigModule {}
