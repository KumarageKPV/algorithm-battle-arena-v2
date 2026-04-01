import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { StudentForRegistrationDto, TeacherForRegistrationDto } from './dto/auth.dto';

/**
 * Port of C# AuthRepository — handles registration, auth lookups, role determination.
 * Uses Prisma transactions instead of Dapper ExecuteTransaction.
 */
@Injectable()
export class AuthRepoService {
  private readonly logger = new Logger(AuthRepoService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  /**
   * Register a new student — INSERT into auth + student in a single transaction.
   */
  async registerStudent(dto: StudentForRegistrationDto): Promise<boolean> {
    const salt = this.authService.getPasswordSalt();
    const hash = this.authService.getPasswordHash(dto.password, salt);

    try {
      await this.prisma.$transaction([
        this.prisma.auth.create({
          data: {
            email: dto.email,
            passwordHash: hash,
            passwordSalt: salt,
          },
        }),
        this.prisma.student.create({
          data: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            teacherId: dto.teacherId ?? null,
            active: true,
          },
        }),
      ]);
      return true;
    } catch (error) {
      this.logger.error('Failed to register student', error);
      return false;
    }
  }

  /**
   * Register a new teacher — INSERT into auth + teachers in a single transaction.
   */
  async registerTeacher(dto: TeacherForRegistrationDto): Promise<boolean> {
    const salt = this.authService.getPasswordSalt();
    const hash = this.authService.getPasswordHash(dto.password, salt);

    try {
      await this.prisma.$transaction([
        this.prisma.auth.create({
          data: {
            email: dto.email,
            passwordHash: hash,
            passwordSalt: salt,
          },
        }),
        this.prisma.teacher.create({
          data: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            active: true,
          },
        }),
      ]);
      return true;
    } catch (error) {
      this.logger.error('Failed to register teacher', error);
      return false;
    }
  }

  /**
   * Get Auth record by email (for password verification).
   */
  async getAuthByEmail(email: string) {
    return this.prisma.auth.findUnique({ where: { email } });
  }

  /**
   * Get student record by email.
   */
  async getStudentByEmail(email: string) {
    return this.prisma.student.findUnique({ where: { email } });
  }

  /**
   * Get teacher record by email.
   */
  async getTeacherByEmail(email: string) {
    return this.prisma.teacher.findUnique({ where: { email } });
  }

  /**
   * Check if a user with this email already exists.
   */
  async userExists(email: string): Promise<boolean> {
    const count = await this.prisma.auth.count({ where: { email } });
    return count > 0;
  }

  /**
   * Determine user role by checking student/teacher tables.
   */
  async getUserRole(email: string): Promise<string> {
    const student = await this.prisma.student.findUnique({ where: { email } });
    if (student) return 'Student';

    const teacher = await this.prisma.teacher.findUnique({ where: { email } });
    if (teacher) return 'Teacher';

    return 'Unknown';
  }

  /**
   * Update password hash/salt (for rehash-on-login).
   */
  async updatePasswordHash(email: string, hash: Buffer, salt: Buffer): Promise<void> {
    await this.prisma.auth.update({
      where: { email },
      data: { passwordHash: hash, passwordSalt: salt },
    });
  }
}

