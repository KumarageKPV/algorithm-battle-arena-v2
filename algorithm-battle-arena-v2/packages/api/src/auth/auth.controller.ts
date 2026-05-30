import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthRepoService } from './auth-repo.service';
import { RefreshTokenService } from './refresh-token.service';
import { JwtAuthGuard } from './guards';
import { UserForLoginDto, StudentForRegistrationDto, TeacherForRegistrationDto } from './dto/auth.dto';

/**
 * Port of C# AuthController — /api/Auth
 * Routes, request shapes, and response shapes are identical to the .NET version.
 */
@Controller('api/Auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly authRepo: AuthRepoService,
    private readonly refreshTokens: RefreshTokenService,
    private readonly configService: ConfigService,
  ) {}

  private getAccessTokenTtlMs(): number {
    const rawSeconds = this.configService.get<string>('ACCESS_TOKEN_TTL_SECONDS');
    const parsedSeconds = rawSeconds ? Number(rawSeconds) : 0;
    if (parsedSeconds > 0) return parsedSeconds * 1000;

    const raw = this.configService.get<string>('ACCESS_TOKEN_TTL') || this.configService.get<string>('JWT_EXPIRY');
    if (raw && raw.endsWith('m')) {
      const minutes = Number(raw.slice(0, -1));
      if (minutes > 0) return minutes * 60 * 1000;
    }
    if (raw && raw.endsWith('h')) {
      const hours = Number(raw.slice(0, -1));
      if (hours > 0) return hours * 60 * 60 * 1000;
    }

    return 15 * 60 * 1000;
  }

  private getRefreshTokenTtlMs(): number {
    const rawSeconds = this.configService.get<string>('REFRESH_TOKEN_TTL_SECONDS');
    const parsedSeconds = rawSeconds ? Number(rawSeconds) : 0;
    if (parsedSeconds > 0) return parsedSeconds * 1000;
    return 7 * 24 * 60 * 60 * 1000;
  }

  private setAuthCookies(res: Response | undefined, accessToken: string, refreshToken: string) {
    if (!res) return;
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';
    const accessMaxAge = this.getAccessTokenTtlMs();
    const refreshMaxAge = this.getRefreshTokenTtlMs();

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: accessMaxAge,
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: refreshMaxAge,
    });
  }

  private clearAuthCookies(res: Response | undefined) {
    if (!res) return;
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';
    res.clearCookie('access_token', { httpOnly: true, secure: isProd, sameSite: 'lax', path: '/' });
    res.clearCookie('refresh_token', { httpOnly: true, secure: isProd, sameSite: 'lax', path: '/' });
  }

  // ─── POST /api/Auth/register/student — [AllowAnonymous] ─────────

  @Post('register/student')
  @HttpCode(HttpStatus.OK)
  async registerStudent(@Body() dto: StudentForRegistrationDto) {
    try {
      if (dto.password !== dto.passwordConfirm) {
        throw new BadRequestException('Passwords do not match');
      }

      if (await this.authRepo.userExists(dto.email)) {
        throw new BadRequestException('User with this email already exists');
      }

      const success = await this.authRepo.registerStudent(dto);
      if (!success) {
        throw new BadRequestException('Failed to register student');
      }

      return { message: 'Student registered successfully' };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error('RegisterStudent failed', error);
      throw new InternalServerErrorException(`Internal server error: ${(error as Error).message}`);
    }
  }

  // ─── POST /api/Auth/register/teacher — [AllowAnonymous] ─────────

  @Post('register/teacher')
  @HttpCode(HttpStatus.OK)
  async registerTeacher(@Body() dto: TeacherForRegistrationDto) {
    try {
      if (dto.password !== dto.passwordConfirm) {
        throw new BadRequestException('Passwords do not match');
      }

      if (await this.authRepo.userExists(dto.email)) {
        throw new BadRequestException('User with this email already exists');
      }

      const success = await this.authRepo.registerTeacher(dto);
      if (!success) {
        throw new BadRequestException('Failed to register teacher');
      }

      return { message: 'Teacher registered successfully' };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error('RegisterTeacher failed', error);
      throw new InternalServerErrorException(`Internal server error: ${(error as Error).message}`);
    }
  }

  // ─── POST /api/Auth/login — [AllowAnonymous] ────────────────────

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: UserForLoginDto,
    @Res({ passthrough: true }) res?: Response,
  ) {
    try {
      // Check admin credentials first (no DB row)
      if (this.authService.validateAdminCredentials(dto.email, dto.password)) {
        const token = this.authService.createToken(dto.email, 'Admin');
        const refreshToken = await this.refreshTokens.issueToken({ email: dto.email, role: 'Admin' });
        this.setAuthCookies(res, token, refreshToken);
        return { token, role: 'Admin', email: dto.email };
      }

      // Fetch auth record
      const authData = await this.authRepo.getAuthByEmail(dto.email);
      if (!authData) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Verify password with rehash fallback
      const { valid, needsRehash } = this.authService.verifyPasswordHash(
        dto.password,
        Buffer.from(authData.passwordHash),
        Buffer.from(authData.passwordSalt),
      );

      if (!valid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Rehash if needed (migration fallback path was used)
      if (needsRehash) {
        const { hash, salt } = this.authService.rehash(dto.password);
        await this.authRepo.updatePasswordHash(dto.email, hash, salt);
        this.logger.log(`Rehashed password for user: ${dto.email}`);
      }

      // Determine role and user ID
      const userRole = await this.authRepo.getUserRole(dto.email);
      let userId: number | undefined;
      let isActive = false;

      if (userRole === 'Student') {
        const student = await this.authRepo.getStudentByEmail(dto.email);
        userId = student?.studentId;
        isActive = student?.active ?? false;
      } else if (userRole === 'Teacher') {
        const teacher = await this.authRepo.getTeacherByEmail(dto.email);
        userId = teacher?.teacherId;
        isActive = teacher?.active ?? false;
      }

      if (userId === undefined) {
        throw new UnauthorizedException('User not found');
      }

      if (!isActive) {
        throw new UnauthorizedException('Account has been deactivated');
      }

      const token = this.authService.createToken(dto.email, userRole, userId);
      const refreshToken = await this.refreshTokens.issueToken({ email: dto.email, role: userRole, userId });
      this.setAuthCookies(res, token, refreshToken);
      return { token, role: userRole, email: dto.email };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.error('Login failed', error);
      throw new InternalServerErrorException(`Internal server error: ${(error as Error).message}`);
    }
  }

  // ─── GET /api/Auth/refresh/token — refresh cookie ────────────────

  @Get('refresh/token')
  async refreshToken(
    @Request() req: any,
    @Res({ passthrough: true }) res?: Response,
  ) {
    try {
      const refreshToken = req?.cookies?.refresh_token as string | undefined;
      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token required');
      }

      const rotated = await this.refreshTokens.rotateToken(refreshToken);
      if (!rotated) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const { payload, token: nextRefreshToken } = rotated;
      if (payload.role === 'Student') {
        const student = await this.authRepo.getStudentByEmail(payload.email);
        if (!student?.active) {
          await this.refreshTokens.revokeToken(nextRefreshToken, payload.email);
          throw new UnauthorizedException('Account has been deactivated');
        }
      } else if (payload.role === 'Teacher') {
        const teacher = await this.authRepo.getTeacherByEmail(payload.email);
        if (!teacher?.active) {
          await this.refreshTokens.revokeToken(nextRefreshToken, payload.email);
          throw new UnauthorizedException('Account has been deactivated');
        }
      }

      const accessToken = this.authService.createToken(payload.email, payload.role, payload.userId);
      this.setAuthCookies(res, accessToken, nextRefreshToken);

      return { token: accessToken, role: payload.role, email: payload.email };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.error('RefreshToken failed', error);
      throw new InternalServerErrorException(`Internal server error: ${(error as Error).message}`);
    }
  }

  // ─── POST /api/Auth/logout — revoke refresh token ────────────────

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: any, @Res({ passthrough: true }) res?: Response) {
    try {
      const refreshToken = req?.cookies?.refresh_token as string | undefined;
      if (refreshToken) {
        await this.refreshTokens.revokeToken(refreshToken);
      }
      this.clearAuthCookies(res);
      return { message: 'Logged out' };
    } catch (error) {
      this.logger.error('Logout failed', error);
      throw new InternalServerErrorException(`Internal server error: ${(error as Error).message}`);
    }
  }

  // ─── GET /api/Auth/profile — [Authorize] ─────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    try {
      const { email, role } = req.user;

      if (!email || !role) {
        throw new UnauthorizedException('Invalid token');
      }

      if (role === 'Student') {
        const student = await this.authRepo.getStudentByEmail(email);
        if (!student) {
          return { statusCode: 404, message: 'Student not found' };
        }
        return {
          id: student.studentId,
          firstName: student.firstName,
          lastName: student.lastName,
          fullName: `${student.firstName} ${student.lastName}`,
          email: student.email,
          teacherId: student.teacherId,
          role: 'Student',
          active: student.active,
        };
      }

      if (role === 'Teacher') {
        const teacher = await this.authRepo.getTeacherByEmail(email);
        if (!teacher) {
          return { statusCode: 404, message: 'Teacher not found' };
        }
        return {
          id: teacher.teacherId,
          firstName: teacher.firstName,
          lastName: teacher.lastName,
          fullName: `${teacher.firstName} ${teacher.lastName}`,
          email: teacher.email,
          role: 'Teacher',
          active: teacher.active,
        };
      }

      if (role === 'Admin') {
        return {
          id: 0,
          firstName: 'Admin',
          lastName: '',
          fullName: 'Admin',
          email,
          role: 'Admin',
          active: true,
        };
      }

      throw new BadRequestException('Invalid user role');
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      this.logger.error('GetProfile failed', error);
      throw new InternalServerErrorException(`Internal server error: ${(error as Error).message}`);
    }
  }
}

