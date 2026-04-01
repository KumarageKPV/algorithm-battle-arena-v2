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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRepoService } from './auth-repo.service';
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
  ) {}

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
  async login(@Body() dto: UserForLoginDto) {
    try {
      // Check admin credentials first (no DB row)
      if (this.authService.validateAdminCredentials(dto.email, dto.password)) {
        const token = this.authService.createToken(dto.email, 'Admin');
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
      return { token, role: userRole, email: dto.email };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.error('Login failed', error);
      throw new InternalServerErrorException(`Internal server error: ${(error as Error).message}`);
    }
  }

  // ─── GET /api/Auth/refresh/token — [Authorize] ──────────────────

  @UseGuards(JwtAuthGuard)
  @Get('refresh/token')
  async refreshToken(@Request() req: any) {
    try {
      const { email, role } = req.user;

      if (!email || !role) {
        throw new UnauthorizedException('Invalid token - missing required claims');
      }

      const userId = this.authService.getUserIdFromPayload(req.user, role);
      if (userId === null && role !== 'Admin') {
        throw new UnauthorizedException('User not found');
      }

      const token = this.authService.createToken(email, role, userId ?? undefined);
      return { token, role, email };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.error('RefreshToken failed', error);
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

