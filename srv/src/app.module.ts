import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { PrismaModule } from './integrations/prisma/prisma.module';
import { RabbitMQConfigModule } from './integrations/rabbitmq/rabbitmq.module';
import { RedisModule } from './integrations/redis/redis.module';

import { ConfigModule } from './config/config.module';

import { AuthModule } from './modules/auth/auth.module';
import { BlockchainsModule } from './modules/blockchains/blockchains.module';
import { LotteriesModule } from './modules/lotteries/lotteries.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { UsersModule } from './modules/users/users.module';
import { WalletsModule } from './modules/wallets/wallets.module';
import { TransactionsModule } from './modules/transactions/transactions.module';

@Module({
  imports: [
    // Core modules
    ConfigModule,
    PrismaModule,
    ScheduleModule.forRoot(),

    // Cache Module (global)
    CacheModule.register({
      isGlobal: true,
    }),

    // Redis Module
    RedisModule,

    // Bull Queue Module (Redis-backed)
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'redis',
        port: parseInt(process.env.HOST_REDIS_PORT) || 6379, // Use HOST port
        password:
          process.env.REDIS_PASSWORD === 'null'
            ? undefined
            : process.env.REDIS_PASSWORD,
      },
    }),

    // RabbitMQ Module
    RabbitMQConfigModule,

    // Feature modules
    AuthModule,
    UsersModule,
    WalletsModule,
    BlockchainsModule,
    LotteriesModule,
    TicketsModule,
    TransactionsModule,
  ],
})
export class AppModule {}
