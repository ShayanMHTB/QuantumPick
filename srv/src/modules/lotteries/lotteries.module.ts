import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from 'src/integrations/prisma/prisma.module';
import { RabbitMQConfigModule } from 'src/integrations/rabbitmq/rabbitmq.module';
import { RedisModule } from 'src/integrations/redis/redis.module';
import { BlockchainsModule } from '../blockchains/blockchains.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { UsersModule } from '../users/users.module';
import { WalletsModule } from '../wallets/wallets.module';
import { LotteryDrawConsumer } from './consumers/lottery-draw.consumer';
import { LotteryStateProcessor } from './consumers/lottery-state.processor';
import { LotteriesController } from './controllers/lotteries.controller';
import { TestingLotteriesController } from './controllers/update-time.controller';
import { LotteriesService } from './services/lotteries.service';
import { LotteryStateManager } from './services/lottery-state.manager';
import { LotteryTemplateService } from './services/lottery-template.service';

@Module({
  imports: [
    PrismaModule,
    BlockchainsModule,
    WalletsModule,
    TransactionsModule,
    RedisModule,
    RabbitMQConfigModule,
    UsersModule,
    ScheduleModule.forRoot(),
    BullModule.registerQueue({
      name: 'lottery-state',
    }),
    BullModule.registerQueue({
      name: 'transactions',
    }),
  ],
  controllers: [LotteriesController, TestingLotteriesController],
  providers: [
    LotteriesService,
    LotteryStateManager,
    LotteryStateProcessor,
    LotteryDrawConsumer,
    LotteryTemplateService, // Add the new service
  ],
  exports: [LotteriesService, LotteryStateManager, LotteryTemplateService],
})
export class LotteriesModule {}
