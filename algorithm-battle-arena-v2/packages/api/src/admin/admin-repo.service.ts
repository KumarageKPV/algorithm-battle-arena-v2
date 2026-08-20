import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PagedResult } from '../common/types';
import { ImportException, ImportErrorDto } from '../common/types';

export interface AdminUserDto {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt?: Date;
}

/**
 * Port of C# AdminRepository + ProblemImportRepository.
 */
@Injectable()
export class AdminRepoService {
  private readonly logger = new Logger(AdminRepoService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getUsersAsync(
    q?: string, role?: string, page = 1, pageSize = 10,
  ): Promise<PagedResult<AdminUserDto>> {
    // Build list from students + teachers with prefixed IDs (same as C#)
    const students = await this.prisma.student.findMany({
      where: {
        ...(q ? {
          OR: [
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        } : {}),
      },
    });

    const teachers = await this.prisma.teacher.findMany({
      where: {
        ...(q ? {
          OR: [
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        } : {}),
      },
    });

    let allUsers: AdminUserDto[] = [
      ...students.map((s: any) => ({
        id: `Student:${s.studentId}`,
        name: `${s.firstName} ${s.lastName}`,
        email: s.email,
        role: 'Student',
        isActive: s.active ?? true,
      })),
      ...teachers.map((t: any) => ({
        id: `Teacher:${t.teacherId}`,
        name: `${t.firstName} ${t.lastName}`,
        email: t.email,
        role: 'Teacher',
        isActive: t.active ?? true,
      })),
    ];

    // Filter by role
    if (role) {
      allUsers = allUsers.filter((u) => u.role === role);
    }

    const total = allUsers.length;
    const items = allUsers.slice((page - 1) * pageSize, page * pageSize);

    return { items, total };
  }

  async toggleUserActiveAsync(id: string, deactivate: boolean): Promise<AdminUserDto | null> {
    // Parse prefixed ID: "Student:123" or "Teacher:456"
    const [rolePrefix, idStr] = id.split(':');
    const numericId = parseInt(idStr, 10);
    if (isNaN(numericId)) return null;

    if (rolePrefix === 'Student') {
      const student = await this.prisma.student.update({
        where: { studentId: numericId },
        data: { active: !deactivate },
      });
      return {
        id, name: `${student.firstName} ${student.lastName}`,
        email: student.email, role: 'Student', isActive: student.active ?? true,
      };
    }

    if (rolePrefix === 'Teacher') {
      const teacher = await this.prisma.teacher.update({
        where: { teacherId: numericId },
        data: { active: !deactivate },
      });
      return {
        id, name: `${teacher.firstName} ${teacher.lastName}`,
        email: teacher.email, role: 'Teacher', isActive: teacher.active ?? true,
      };
    }

    return null;
  }

  // ─── Problem Import (port of ProblemImportRepository) ────────────

  async importProblemsAsync(problems: any[]): Promise<{
    ok: boolean; inserted: number; slugs: string[]; errors: ImportErrorDto[];
  }> {
    const allErrors: ImportErrorDto[] = [];
    const slugs: string[] = [];
    let inserted = 0;

    // Validate all problems first
    for (let i = 0; i < problems.length; i++) {
      const errors = this.validateProblem(problems[i], i + 1);
      allErrors.push(...errors);
    }

    if (allErrors.length > 0) {
      throw new ImportException(allErrors);
    }

    // Insert validated problems
    for (const problem of problems) {
      await this.prisma.$transaction(async (tx: any) => {
        const created = await tx.problem.create({
          data: {
            title: problem.title,
            description: problem.description,
            difficultyLevel: problem.difficultyLevel,
            category: problem.category,
            timeLimit: problem.timeLimit,
            memoryLimit: problem.memoryLimit,
            createdBy: problem.createdBy,
            tags: typeof problem.tags === 'string' ? problem.tags : JSON.stringify(problem.tags || []),
          },
        });

        if (problem.testCases?.length) {
          await tx.problemTestCase.createMany({
            data: problem.testCases.map((tc: any) => ({
              problemId: created.problemId,
              inputData: tc.inputData,
              expectedOutput: tc.expectedOutput,
              isSample: tc.isSample ?? false,
            })),
          });
        }

        if (problem.solutions?.length) {
          await tx.problemSolution.createMany({
            data: problem.solutions.map((sol: any) => ({
              problemId: created.problemId,
              language: sol.language,
              solutionText: sol.solutionText,
            })),
          });
        }

        slugs.push(problem.title.toLowerCase().replace(/\s+/g, '-'));
        inserted++;
      });
    }

    return { ok: true, inserted, slugs, errors: [] };
  }

  private validateProblem(problem: any, row: number): ImportErrorDto[] {
    const errors: ImportErrorDto[] = [];

    if (!problem.title?.trim()) {
      errors.push({ row, field: 'title', message: 'Title is required' });
    } else if (problem.title.length > 255) {
      errors.push({ row, field: 'title', message: 'Title must be 255 characters or less' });
    }

    if (!problem.description?.trim()) {
      errors.push({ row, field: 'description', message: 'Description is required' });
    }

    const validDifficulties = ['Easy', 'Medium', 'Hard'];
    if (problem.difficultyLevel && !validDifficulties.includes(problem.difficultyLevel)) {
      errors.push({ row, field: 'difficultyLevel', message: 'Must be Easy, Medium, or Hard' });
    }

    if (problem.timeLimit !== undefined && problem.timeLimit <= 0) {
      errors.push({ row, field: 'timeLimit', message: 'Must be greater than 0' });
    }

    if (problem.memoryLimit !== undefined && problem.memoryLimit <= 0) {
      errors.push({ row, field: 'memoryLimit', message: 'Must be greater than 0' });
    }

    if (!problem.testCases || problem.testCases.length === 0) {
      errors.push({ row, field: 'testCases', message: 'At least 1 test case is required' });
    }

    if (!problem.solutions || problem.solutions.length === 0) {
      errors.push({ row, field: 'solutions', message: 'At least 1 solution is required' });
    }

    return errors;
  }
}



