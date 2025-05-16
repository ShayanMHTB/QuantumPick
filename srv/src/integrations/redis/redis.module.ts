import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisService } from './redis.service';
import * as redisStore from 'cache-manager-redis-store';

@Global()
@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: 'localhost', // Connect to localhost, not 'redis'
      port: parseInt(process.env.HOST_REDIS_PORT) || 6379, // Use the mapped port
      password:
        process.env.REDIS_PASSWORD === 'null'
          ? undefined
          : process.env.REDIS_PASSWORD,
      ttl: 60 * 60 * 24, // 24 hours default TTL
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
  controllers: [],
})
export class RedisModule {}
