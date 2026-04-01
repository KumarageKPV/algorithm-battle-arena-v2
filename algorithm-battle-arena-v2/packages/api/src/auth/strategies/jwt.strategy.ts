import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * JWT Strategy — mirrors C# JWT validation in Program.cs.
 * Extracts token from Authorization: Bearer header.
 * For Socket.IO, token is extracted via ?access_token= query param in gateway middleware.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is missing from environment variables!');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      algorithms: ['HS512'],
    });
  }

  /**
   * Called after JWT is verified. The returned object is attached to request.user.
   */
  validate(payload: any) {
    return {
      email: payload.email,
      role: payload.role,
      studentId: payload.studentId,
      teacherId: payload.teacherId,
    };
  }
}

