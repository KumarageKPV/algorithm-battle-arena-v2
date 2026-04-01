import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { AuthRepoService } from '../auth-repo.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let authRepo: jest.Mocked<AuthRepoService>;

  beforeEach(async () => {
    const mockAuthService = {
      getPasswordHash: jest.fn(),
      getPasswordSalt: jest.fn(),
      verifyPasswordHash: jest.fn(),
      rehash: jest.fn(),
      createToken: jest.fn().mockReturnValue('mock.jwt.token'),
      validateAdminCredentials: jest.fn().mockReturnValue(false),
      getUserIdFromPayload: jest.fn(),
      getEmailFromPayload: jest.fn(),
      getRoleFromPayload: jest.fn(),
    };

    const mockAuthRepo = {
      registerStudent: jest.fn(),
      registerTeacher: jest.fn(),
      userExists: jest.fn(),
      getAuthByEmail: jest.fn(),
      getStudentByEmail: jest.fn(),
      getTeacherByEmail: jest.fn(),
      getUserRole: jest.fn(),
      updatePasswordHash: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: AuthRepoService, useValue: mockAuthRepo },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
    authRepo = module.get(AuthRepoService);
  });

  // ─── Registration ──────────────────────────────────────────────

  describe('registerStudent', () => {
    const dto = {
      email: 'student@test.com',
      password: 'Password123',
      passwordConfirm: 'Password123',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should register student successfully', async () => {
      authRepo.userExists.mockResolvedValue(false);
      authRepo.registerStudent.mockResolvedValue(true);

      const result = await controller.registerStudent(dto as any);
      expect(result).toEqual({ message: 'Student registered successfully' });
      expect(authRepo.registerStudent).toHaveBeenCalledWith(dto);
    });

    it('should throw BadRequestException if passwords do not match', async () => {
      await expect(
        controller.registerStudent({ ...dto, passwordConfirm: 'Different' } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if user already exists', async () => {
      authRepo.userExists.mockResolvedValue(true);
      await expect(controller.registerStudent(dto as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if registration fails', async () => {
      authRepo.userExists.mockResolvedValue(false);
      authRepo.registerStudent.mockResolvedValue(false);
      await expect(controller.registerStudent(dto as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('registerTeacher', () => {
    const dto = {
      email: 'teacher@test.com',
      password: 'Password123',
      passwordConfirm: 'Password123',
      firstName: 'Jane',
      lastName: 'Smith',
    };

    it('should register teacher successfully', async () => {
      authRepo.userExists.mockResolvedValue(false);
      authRepo.registerTeacher.mockResolvedValue(true);

      const result = await controller.registerTeacher(dto as any);
      expect(result).toEqual({ message: 'Teacher registered successfully' });
    });

    it('should throw BadRequestException if passwords do not match', async () => {
      await expect(
        controller.registerTeacher({ ...dto, passwordConfirm: 'Different' } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── Login ─────────────────────────────────────────────────────

  describe('login', () => {
    const loginDto = { email: 'user@test.com', password: 'Password123' };

    it('should return token for admin credentials', async () => {
      authService.validateAdminCredentials.mockReturnValue(true);

      const result = await controller.login(loginDto as any);
      expect(result).toEqual({ token: 'mock.jwt.token', role: 'Admin', email: loginDto.email });
    });

    it('should return token for valid student credentials', async () => {
      authService.validateAdminCredentials.mockReturnValue(false);
      authRepo.getAuthByEmail.mockResolvedValue({
        email: loginDto.email,
        passwordHash: Buffer.from('hash'),
        passwordSalt: Buffer.from('salt'),
      });
      authService.verifyPasswordHash.mockReturnValue({ valid: true, needsRehash: false });
      authRepo.getUserRole.mockResolvedValue('Student');
      authRepo.getStudentByEmail.mockResolvedValue({
        studentId: 1, firstName: 'John', lastName: 'Doe',
        email: loginDto.email, active: true, teacherId: null,
      });

      const result = await controller.login(loginDto as any);
      expect(result.token).toBe('mock.jwt.token');
      expect(result.role).toBe('Student');
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      authService.validateAdminCredentials.mockReturnValue(false);
      authRepo.getAuthByEmail.mockResolvedValue(null);

      await expect(controller.login(loginDto as any)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      authService.validateAdminCredentials.mockReturnValue(false);
      authRepo.getAuthByEmail.mockResolvedValue({
        email: loginDto.email,
        passwordHash: Buffer.from('hash'),
        passwordSalt: Buffer.from('salt'),
      });
      authService.verifyPasswordHash.mockReturnValue({ valid: false, needsRehash: false });

      await expect(controller.login(loginDto as any)).rejects.toThrow(UnauthorizedException);
    });

    it('should rehash password when needsRehash is true', async () => {
      authService.validateAdminCredentials.mockReturnValue(false);
      authRepo.getAuthByEmail.mockResolvedValue({
        email: loginDto.email,
        passwordHash: Buffer.from('hash'),
        passwordSalt: Buffer.from('salt'),
      });
      authService.verifyPasswordHash.mockReturnValue({ valid: true, needsRehash: true });
      authService.rehash.mockReturnValue({ hash: Buffer.from('newhash'), salt: Buffer.from('newsalt') });
      authRepo.getUserRole.mockResolvedValue('Student');
      authRepo.getStudentByEmail.mockResolvedValue({
        studentId: 1, firstName: 'John', lastName: 'Doe',
        email: loginDto.email, active: true, teacherId: null,
      });

      await controller.login(loginDto as any);
      expect(authService.rehash).toHaveBeenCalledWith(loginDto.password);
      expect(authRepo.updatePasswordHash).toHaveBeenCalledWith(
        loginDto.email, Buffer.from('newhash'), Buffer.from('newsalt'),
      );
    });

    it('should throw UnauthorizedException for deactivated account', async () => {
      authService.validateAdminCredentials.mockReturnValue(false);
      authRepo.getAuthByEmail.mockResolvedValue({
        email: loginDto.email,
        passwordHash: Buffer.from('hash'),
        passwordSalt: Buffer.from('salt'),
      });
      authService.verifyPasswordHash.mockReturnValue({ valid: true, needsRehash: false });
      authRepo.getUserRole.mockResolvedValue('Student');
      authRepo.getStudentByEmail.mockResolvedValue({
        studentId: 1, firstName: 'John', lastName: 'Doe',
        email: loginDto.email, active: false, teacherId: null,
      });

      await expect(controller.login(loginDto as any)).rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── Refresh Token ─────────────────────────────────────────────

  describe('refreshToken', () => {
    it('should return new token for valid user', async () => {
      const req = { user: { email: 'user@test.com', role: 'Student', studentId: 1 } };
      authService.getUserIdFromPayload.mockReturnValue(1);

      const result = await controller.refreshToken(req);
      expect(result.token).toBe('mock.jwt.token');
      expect(result.role).toBe('Student');
    });

    it('should throw UnauthorizedException for missing claims', async () => {
      const req = { user: {} };
      await expect(controller.refreshToken(req)).rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── Profile ───────────────────────────────────────────────────

  describe('getProfile', () => {
    it('should return student profile', async () => {
      const req = { user: { email: 'student@test.com', role: 'Student' } };
      authRepo.getStudentByEmail.mockResolvedValue({
        studentId: 1, firstName: 'John', lastName: 'Doe',
        email: 'student@test.com', active: true, teacherId: null,
      });

      const result = await controller.getProfile(req);
      expect(result).toMatchObject({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        role: 'Student',
      });
    });

    it('should return teacher profile', async () => {
      const req = { user: { email: 'teacher@test.com', role: 'Teacher' } };
      authRepo.getTeacherByEmail.mockResolvedValue({
        teacherId: 5, firstName: 'Jane', lastName: 'Smith',
        email: 'teacher@test.com', active: true,
      });

      const result = await controller.getProfile(req);
      expect(result).toMatchObject({
        id: 5,
        firstName: 'Jane',
        role: 'Teacher',
      });
    });

    it('should return admin profile', async () => {
      const req = { user: { email: 'admin@test.com', role: 'Admin' } };

      const result = await controller.getProfile(req);
      expect(result).toMatchObject({
        id: 0,
        firstName: 'Admin',
        role: 'Admin',
      });
    });
  });
});

