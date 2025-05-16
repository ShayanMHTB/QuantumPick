// src/modules/lotteries/lotteries.module.ts
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from 'src/integrations/prisma/prisma.module';
import { RabbitMQConfigModule } from 'src/integrations/rabbitmq/rabbitmq.module';
import { RedisModule } from 'src/integrations/redis/redis.module';
import { BlockchainsModule } from '../blockchains/blockchains.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { WalletsModule } from '../wallets/wallets.module';
import { LotteryDrawConsumer } from './consumers/lottery-draw.consumer';
import { LotteryStateProcessor } from './consumers/lottery-state.processor';
import { LotteriesController } from './controllers/lotteries.controller';
import { TestingLotteriesController } from './controllers/update-time.controller';
import { LotteriesService } from './services/lotteries.service';
import { LotteryStateManager } from './services/lottery-state.manager';

@Module({
  imports: [
    PrismaModule,
    BlockchainsModule,
    WalletsModule,
    TransactionsModule,
    RedisModule,
    RabbitMQConfigModule,
    ScheduleModule.forRoot(),
    BullModule.registerQueue({
      name: 'lottery-state',
    }),
    // Add this to register the transactions queue
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
  ],
  exports: [LotteriesService, LotteryStateManager],
})
export class LotteriesModule {}
