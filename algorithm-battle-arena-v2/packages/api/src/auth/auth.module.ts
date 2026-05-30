import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { AuthService } from './auth.service';
import { AuthRepoService } from './auth-repo.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard, AdminGuard, StudentGuard, StudentOrAdminGuard } from './guards';
import { RefreshTokenService } from './refresh-token.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    RedisModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const ttlSecondsRaw = configService.get<string>('ACCESS_TOKEN_TTL_SECONDS');
        const ttlSeconds = ttlSecondsRaw ? Number(ttlSecondsRaw) : 0;
        const fallback = (configService.get<string>('ACCESS_TOKEN_TTL') ||
          configService.get<string>('JWT_EXPIRY') ||
          '15m') as StringValue;

        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: ttlSeconds > 0 ? ttlSeconds : fallback,
            algorithm: 'HS512',
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepoService,
    RefreshTokenService,
    JwtStrategy,
    JwtAuthGuard,
    AdminGuard,
    StudentGuard,
    StudentOrAdminGuard,
  ],
  exports: [AuthService, AuthRepoService, RefreshTokenService, JwtAuthGuard, AdminGuard, StudentGuard, StudentOrAdminGuard, JwtModule],
})
export class AuthModule {}
