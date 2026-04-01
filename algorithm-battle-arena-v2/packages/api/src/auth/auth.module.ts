import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthRepoService } from './auth-repo.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard, AdminGuard, StudentGuard, StudentOrAdminGuard } from './guards';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '24h',
          algorithm: 'HS512',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepoService,
    JwtStrategy,
    JwtAuthGuard,
    AdminGuard,
    StudentGuard,
    StudentOrAdminGuard,
  ],
  exports: [AuthService, AuthRepoService, JwtAuthGuard, AdminGuard, StudentGuard, StudentOrAdminGuard, JwtModule],
})
export class AuthModule {}

