import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { RedisService } from '../redis/redis.service';

export interface RefreshTokenPayload {
  email: string;
  role: string;
  userId?: number;
}

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly redis: RedisService,
    private readonly configService: ConfigService,
  ) {}

  private get ttlSeconds(): number {
    const raw = this.configService.get<string>('REFRESH_TOKEN_TTL_SECONDS');
    const parsed = raw ? Number(raw) : 0;
    return parsed > 0 ? parsed : 60 * 60 * 24 * 7;
  }

  private getKey(token: string): string {
    return `refresh:${token}`;
  }

  private getUserKey(email: string): string {
    return `refresh:user:${email}`;
  }

  async issueToken(payload: RefreshTokenPayload): Promise<string> {
    const token = crypto.randomBytes(48).toString('base64url');
    const key = this.getKey(token);
    const userKey = this.getUserKey(payload.email);

    await this.redis.setJson(key, payload, this.ttlSeconds);
    await this.redis.sadd(userKey, token);
    await this.redis.expire(userKey, this.ttlSeconds);

    return token;
  }

  async getTokenPayload(token: string): Promise<RefreshTokenPayload | null> {
    return this.redis.getJson<RefreshTokenPayload>(this.getKey(token));
  }

  async rotateToken(token: string): Promise<{ token: string; payload: RefreshTokenPayload } | null> {
    const payload = await this.getTokenPayload(token);
    if (!payload) return null;

    await this.revokeToken(token, payload.email);
    const nextToken = await this.issueToken(payload);

    return { token: nextToken, payload };
  }

  async revokeToken(token: string, email?: string): Promise<void> {
    const payloadEmail = email ?? (await this.getTokenPayload(token))?.email;
    if (payloadEmail) {
      await this.redis.srem(this.getUserKey(payloadEmail), token);
    }
    await this.redis.del(this.getKey(token));
  }
}

