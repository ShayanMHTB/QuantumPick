import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import Redis from 'ioredis';
import { Logger } from '@nestjs/common';

@Injectable()
export class RedisService {
  private readonly redis: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    // Initialize a direct Redis connection
    this.redis = new Redis({
      host: 'localhost',
      port: parseInt(process.env.HOST_REDIS_PORT) || 6379,
      password:
        process.env.REDIS_PASSWORD === 'null'
          ? undefined
          : process.env.REDIS_PASSWORD,
    });

    // Test connection
    this.redis.on('connect', () => {
      this.logger.log('Connected to Redis');
    });

    this.redis.on('error', (err) => {
      this.logger.error('Redis connection error', err);
    });
  }

  // Direct Redis methods for testing
  async ping(): Promise<string> {
    return this.redis.ping();
  }

  // Store a key-value pair
  async set(key: string, value: any, ttl?: number): Promise<string> {
    try {
      let result;
      if (ttl) {
        result = await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
      } else {
        result = await this.redis.set(key, JSON.stringify(value));
      }
      this.logger.debug(`Redis SET ${key} result: ${result}`);
      return result;
    } catch (error) {
      this.logger.error(`Error setting Redis key ${key}:`, error);
      throw error;
    }
  }

  // Get a value by key
  async get(key: string): Promise<any> {
    try {
      const value = await this.redis.get(key);
      this.logger.debug(`Redis GET ${key} result: ${value}`);
      if (value) {
        try {
          return JSON.parse(value);
        } catch (e) {
          return value;
        }
      }
      return null;
    } catch (error) {
      this.logger.error(`Error getting Redis key ${key}:`, error);
      throw error;
    }
  }

  // Delete a key
  async del(key: string): Promise<number> {
    return this.redis.del(key);
  }

  // Publish to a channel
  async publish(channel: string, message: string): Promise<number> {
    return this.redis.publish(channel, message);
  }

  // Subscribe to a channel
  async subscribe(
    channel: string,
    callback: (channel: string, message: string) => void,
  ): Promise<void> {
    const subscriber = this.redis.duplicate();
    await subscriber.subscribe(channel);
    subscriber.on('message', callback);
  }

  // For debugging: get all keys
  async getAllKeys(): Promise<string[]> {
    return this.redis.keys('*');
  }
}
