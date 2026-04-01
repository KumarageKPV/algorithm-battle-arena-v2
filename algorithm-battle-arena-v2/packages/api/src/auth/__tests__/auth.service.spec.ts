import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import * as crypto from 'crypto';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;

  const TEST_PASSWORD_KEY = 'test_password_key';
  const TEST_JWT_SECRET = 'test_jwt_secret_key_that_is_at_least_64_characters_for_hs512_algorithm_testing';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              const config: Record<string, string> = {
                PASSWORD_KEY: TEST_PASSWORD_KEY,
                ADMIN_EMAIL: 'admin@test.com',
                ADMIN_PASSWORD: 'adminpass',
              };
              return config[key];
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock.jwt.token'),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  // ─── Password Salt ─────────────────────────────────────────────

  describe('getPasswordSalt', () => {
    it('should return a 16-byte buffer', () => {
      const salt = authService.getPasswordSalt();
      expect(Buffer.isBuffer(salt)).toBe(true);
      expect(salt.length).toBe(16);
    });

    it('should return different salts on each call', () => {
      const salt1 = authService.getPasswordSalt();
      const salt2 = authService.getPasswordSalt();
      expect(salt1.equals(salt2)).toBe(false);
    });
  });

  // ─── Password Hash (.NET PBKDF2 Compatibility) ─────────────────

  describe('getPasswordHash', () => {
    it('should return a 32-byte buffer', () => {
      const salt = Buffer.from('a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'hex');
      const hash = authService.getPasswordHash('password123', salt);
      expect(Buffer.isBuffer(hash)).toBe(true);
      expect(hash.length).toBe(32);
    });

    it('should produce the same hash for the same input', () => {
      const salt = Buffer.from('a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'hex');
      const hash1 = authService.getPasswordHash('password123', salt);
      const hash2 = authService.getPasswordHash('password123', salt);
      expect(hash1.equals(hash2)).toBe(true);
    });

    it('should produce different hashes for different passwords', () => {
      const salt = Buffer.from('a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'hex');
      const hash1 = authService.getPasswordHash('password123', salt);
      const hash2 = authService.getPasswordHash('differentpass', salt);
      expect(hash1.equals(hash2)).toBe(false);
    });

    it('should produce different hashes for different salts', () => {
      const salt1 = Buffer.from('a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'hex');
      const salt2 = Buffer.from('11223344556677889900aabbccddeeff', 'hex');
      const hash1 = authService.getPasswordHash('password123', salt1);
      const hash2 = authService.getPasswordHash('password123', salt2);
      expect(hash1.equals(hash2)).toBe(false);
    });

    it('should use combined salt = PasswordKey bytes + random salt', () => {
      // Manually compute to verify the algorithm
      const salt = Buffer.from('a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'hex');
      const combinedSalt = Buffer.concat([Buffer.from(TEST_PASSWORD_KEY, 'utf8'), salt]);
      const expected = crypto.pbkdf2Sync('MyPassword', combinedSalt, 100_000, 32, 'sha256');

      const result = authService.getPasswordHash('MyPassword', salt);
      expect(result.equals(expected)).toBe(true);
    });
  });

  // ─── Verify Password Hash ──────────────────────────────────────

  describe('verifyPasswordHash', () => {
    it('should return valid=true for correct password', () => {
      const salt = authService.getPasswordSalt();
      const hash = authService.getPasswordHash('correctPassword', salt);
      const result = authService.verifyPasswordHash('correctPassword', hash, salt);
      expect(result.valid).toBe(true);
      expect(result.needsRehash).toBe(false);
    });

    it('should return valid=false for incorrect password', () => {
      const salt = authService.getPasswordSalt();
      const hash = authService.getPasswordHash('correctPassword', salt);
      const result = authService.verifyPasswordHash('wrongPassword', hash, salt);
      expect(result.valid).toBe(false);
    });

    it('should detect fallback path and flag needsRehash', () => {
      // Simulate a hash created without PasswordKey prefix (fallback path)
      const salt = authService.getPasswordSalt();
      const altHash = crypto.pbkdf2Sync('testpass', salt, 100_000, 32, 'sha256');
      const result = authService.verifyPasswordHash('testpass', altHash, salt);
      expect(result.valid).toBe(true);
      expect(result.needsRehash).toBe(true);
    });
  });

  // ─── Rehash ────────────────────────────────────────────────────

  describe('rehash', () => {
    it('should return new hash and salt', () => {
      const { hash, salt } = authService.rehash('newpassword');
      expect(Buffer.isBuffer(hash)).toBe(true);
      expect(Buffer.isBuffer(salt)).toBe(true);
      expect(hash.length).toBe(32);
      expect(salt.length).toBe(16);
    });

    it('should produce verifiable hash', () => {
      const { hash, salt } = authService.rehash('newpassword');
      const result = authService.verifyPasswordHash('newpassword', hash, salt);
      expect(result.valid).toBe(true);
      expect(result.needsRehash).toBe(false);
    });
  });

  // ─── JWT Token Creation ────────────────────────────────────────

  describe('createToken', () => {
    it('should call jwtService.sign with correct payload for Student', () => {
      authService.createToken('student@test.com', 'Student', 42);
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: 'student@test.com',
        role: 'Student',
        studentId: 42,
      });
    });

    it('should call jwtService.sign with correct payload for Teacher', () => {
      authService.createToken('teacher@test.com', 'Teacher', 7);
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: 'teacher@test.com',
        role: 'Teacher',
        teacherId: 7,
      });
    });

    it('should call jwtService.sign without userId for Admin', () => {
      authService.createToken('admin@test.com', 'Admin');
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: 'admin@test.com',
        role: 'Admin',
      });
    });
  });

  // ─── Admin Credentials ────────────────────────────────────────

  describe('validateAdminCredentials', () => {
    it('should return true for matching credentials', () => {
      expect(authService.validateAdminCredentials('admin@test.com', 'adminpass')).toBe(true);
    });

    it('should return false for wrong email', () => {
      expect(authService.validateAdminCredentials('wrong@test.com', 'adminpass')).toBe(false);
    });

    it('should return false for wrong password', () => {
      expect(authService.validateAdminCredentials('admin@test.com', 'wrongpass')).toBe(false);
    });
  });

  // ─── Claim Extraction Helpers ──────────────────────────────────

  describe('getEmailFromPayload', () => {
    it('should extract email', () => {
      expect(authService.getEmailFromPayload({ email: 'test@test.com' })).toBe('test@test.com');
    });
    it('should return null for missing email', () => {
      expect(authService.getEmailFromPayload({})).toBeNull();
    });
  });

  describe('getUserIdFromPayload', () => {
    it('should extract studentId for Student role', () => {
      expect(authService.getUserIdFromPayload({ studentId: 42 }, 'Student')).toBe(42);
    });
    it('should extract teacherId for Teacher role', () => {
      expect(authService.getUserIdFromPayload({ teacherId: 7 }, 'Teacher')).toBe(7);
    });
    it('should return null for Admin role', () => {
      expect(authService.getUserIdFromPayload({}, 'Admin')).toBeNull();
    });
  });
});

