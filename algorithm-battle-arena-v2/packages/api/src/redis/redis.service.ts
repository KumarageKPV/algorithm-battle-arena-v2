import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('REDIS_URL');
    if (!url) {
      throw new Error('REDIS_URL is missing from environment variables!');
    }

    // Parse Redis URL and configure for Upstash with TLS
    const redisOptions = this.parseRedisUrl(url);
    this.client = new Redis(redisOptions);

    this.client.on('error', (err) => {
      this.logger.error('Redis connection error', err as Error);
    });

    this.client.on('connect', () => {
      this.logger.log('Redis connected successfully');
    });

    this.client.on('ready', () => {
      this.logger.log('Redis is ready');
    });
  }

  private parseRedisUrl(url: string): Record<string, any> {
    // Parse redis://user:pass@host:port format
    const redisUrl = new URL(url);
    
    return {
      host: redisUrl.hostname,
      port: parseInt(redisUrl.port) || 6379,
      username: redisUrl.username || 'default',
      password: redisUrl.password,
      // Enable TLS for Upstash
      tls: {},
      // Disable auto-retry; let caller handle retries
      maxRetriesPerRequest: null,
      // Connection timeout
      connectTimeout: 10000,
      // Retry strategy
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    };
  }

  getClient(): Redis {
    return this.client;
  }

  async setJson(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const payload = JSON.stringify(value);
    if (ttlSeconds && ttlSeconds > 0) {
      await this.client.set(key, payload, 'EX', ttlSeconds);
      return;
    }
    await this.client.set(key, payload);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async sadd(key: string, value: string): Promise<void> {
    await this.client.sadd(key, value);
  }

  async srem(key: string, value: string): Promise<void> {
    await this.client.srem(key, value);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}

