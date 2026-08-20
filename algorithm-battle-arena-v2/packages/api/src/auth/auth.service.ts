import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

/**
 * Port of C# AuthHelper.cs — password hashing + JWT creation.
 *
 * CRITICAL: The PBKDF2 implementation must be byte-identical to .NET's
 * KeyDerivation.Pbkdf2 with HMACSHA256, 100K iterations, 32-byte output.
 * Salt = Buffer.concat([Buffer.from(PASSWORD_KEY, 'utf8'), randomSalt])
 *
 * Includes rehash-on-login fallback to prevent user lockout during migration.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly passwordKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    const key = this.configService.get<string>('PASSWORD_KEY');
    if (!key) {
      throw new Error('PASSWORD_KEY is missing from environment variables!');
    }
    this.passwordKey = key;
  }

  // ─── Password Salt ───────────────────────────────────────────────

  getPasswordSalt(): Buffer {
    return crypto.randomBytes(16);
  }

  // ─── Password Hash (mirrors C# KeyDerivation.Pbkdf2) ────────────

  getPasswordHash(password: string, salt: Buffer): Buffer {
    const passwordKeyBytes = Buffer.from(this.passwordKey, 'utf8');
    const combinedSalt = Buffer.concat([passwordKeyBytes, salt]);

    // PBKDF2-HMAC-SHA256, 100K iterations, 32-byte output
    // This matches .NET's KeyDerivation.Pbkdf2(prf: HMACSHA256)
    return crypto.pbkdf2Sync(password, combinedSalt, 100_000, 32, 'sha256');
  }

  // ─── Verify Password Hash ───────────────────────────────────────

  verifyPasswordHash(
    password: string,
    storedHash: Buffer,
    storedSalt: Buffer,
  ): { valid: boolean; needsRehash: boolean } {
    // Primary path: standard hash comparison
    const computedHash = this.getPasswordHash(password, storedSalt);

    if (crypto.timingSafeEqual(computedHash, storedHash)) {
      return { valid: true, needsRehash: false };
    }

    // Fallback rehash path: try alternate salt compositions for migration edge cases.
    // If the old system used a different byte encoding or salt composition,
    // we attempt a secondary verification.
    try {
      // Alternate: salt without PasswordKey prefix (raw salt only)
      const altHash = crypto.pbkdf2Sync(password, storedSalt, 100_000, 32, 'sha256');
      if (altHash.length === storedHash.length && crypto.timingSafeEqual(altHash, storedHash)) {
        this.logger.warn('Password matched via fallback path — user needs rehash');
        return { valid: true, needsRehash: true };
      }
    } catch {
      // Fallback failed — that's fine, primary path already failed
    }

    return { valid: false, needsRehash: false };
  }

  // ─── Rehash (update hash/salt to current algorithm) ──────────────

  rehash(password: string): { hash: Buffer; salt: Buffer } {
    const salt = this.getPasswordSalt();
    const hash = this.getPasswordHash(password, salt);
    return { hash, salt };
  }

  // ─── JWT Token Creation (mirrors C# CreateToken) ─────────────────

  createToken(email: string, role: string, userId?: number): string {
    const payload: Record<string, any> = {
      email,
      role,
    };

    if (userId !== undefined && userId !== null) {
      const claimType =
        role === 'Student' ? 'studentId' :
        role === 'Teacher' ? 'teacherId' :
        'userId';
      payload[claimType] = userId;
    }

    return this.jwtService.sign(payload);
  }

  // ─── Validate Admin Credentials ──────────────────────────────────

  validateAdminCredentials(email: string, password: string): boolean {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

    return (
      !!adminEmail &&
      !!adminPassword &&
      email === adminEmail &&
      password === adminPassword
    );
  }

  // ─── Claim Extraction Helpers ────────────────────────────────────

  getEmailFromPayload(payload: any): string | null {
    return payload?.email ?? null;
  }

  getRoleFromPayload(payload: any): string | null {
    return payload?.role ?? null;
  }

  getUserIdFromPayload(payload: any, role: string): number | null {
    const key = role === 'Student' ? 'studentId' : role === 'Teacher' ? 'teacherId' : null;
    if (!key) return null;
    const val = payload?.[key];
    return typeof val === 'number' ? val : (typeof val === 'string' ? parseInt(val, 10) || null : null);
  }
}

