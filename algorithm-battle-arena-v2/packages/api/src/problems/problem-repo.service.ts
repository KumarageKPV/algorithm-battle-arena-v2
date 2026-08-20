import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PagedResult } from '../common/types';
import { ProblemFilterDto, ProblemUpsertDto, ProblemGenerationDto } from './dto/problems.dto';

// ─── Response DTOs ───────────────────────────────────────────────────────

export interface ProblemListDto {
  problemId: number;
  title: string;
  difficultyLevel: string | null;
  category: string | null;
  createdBy: string | null;
  createdAt: Date | null;
}

export { ProblemFilterDto, ProblemUpsertDto, ProblemGenerationDto };

/**
 * Port of C# ProblemRepository — uses Prisma instead of Dapper + stored procedure.
 * spUpsertProblem is replaced by Prisma transaction logic.
 */
@Injectable()
export class ProblemRepoService {
  private readonly logger = new Logger(ProblemRepoService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Upsert problem with test cases and solutions in a single transaction.
   * Replaces spUpsertProblem stored procedure.
   */
  async upsertProblem(dto: ProblemUpsertDto): Promise<number> {
    return this.prisma.$transaction(async (tx: any) => {
      // Upsert the problem
      const existing = await tx.problem.findFirst({ where: { title: dto.title } });
      let problemId: number;

      if (existing) {
        await tx.problem.update({
          where: { problemId: existing.problemId },
          data: {
            description: dto.description,
            difficultyLevel: dto.difficultyLevel,
            category: dto.category,
            timeLimit: dto.timeLimit,
            memoryLimit: dto.memoryLimit,
            createdBy: dto.createdBy,
            tags: dto.tags,
          },
        });
        problemId = existing.problemId;
      } else {
        const created = await tx.problem.create({
          data: {
            title: dto.title,
            description: dto.description,
            difficultyLevel: dto.difficultyLevel,
            category: dto.category,
            timeLimit: dto.timeLimit,
            memoryLimit: dto.memoryLimit,
            createdBy: dto.createdBy,
            tags: dto.tags,
          },
        });
        problemId = created.problemId;
      }

      // Upsert test cases
      if (dto.testCases) {
        const testCases = JSON.parse(dto.testCases) as Array<{
          inputData: string; expectedOutput: string; isSample: boolean;
        }>;

        for (const tc of testCases) {
          const existingTc = await tx.problemTestCase.findFirst({
            where: { problemId, inputData: tc.inputData },
          });

          if (existingTc) {
            await tx.problemTestCase.update({
              where: { testCaseId: existingTc.testCaseId },
              data: { expectedOutput: tc.expectedOutput, isSample: tc.isSample },
            });
          } else {
            await tx.problemTestCase.create({
              data: {
                problemId,
                inputData: tc.inputData,
                expectedOutput: tc.expectedOutput,
                isSample: tc.isSample ?? false,
              },
            });
          }
        }
      }

      // Upsert solutions
      if (dto.solutions) {
        const solutions = JSON.parse(dto.solutions) as Array<{
          language: string; solutionText: string;
        }>;

        for (const sol of solutions) {
          const existingSol = await tx.problemSolution.findFirst({
            where: { problemId, language: sol.language },
          });

          if (existingSol) {
            await tx.problemSolution.update({
              where: { solutionId: existingSol.solutionId },
              data: { solutionText: sol.solutionText },
            });
          } else {
            await tx.problemSolution.create({
              data: {
                problemId,
                language: sol.language,
                solutionText: sol.solutionText,
              },
            });
          }
        }
      }

      return problemId;
    });
  }

  async getProblems(filter: ProblemFilterDto): Promise<PagedResult<ProblemListDto>> {
    const page = filter.page ?? 1;
    const pageSize = filter.pageSize ?? 10;
    const where: any = {};

    if (filter.category) where.category = filter.category;
    if (filter.difficultyLevel) where.difficultyLevel = filter.difficultyLevel;
    if (filter.searchTerm) {
      where.OR = [
        { title: { contains: filter.searchTerm, mode: 'insensitive' } },
        { description: { contains: filter.searchTerm, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.problem.findMany({
        where,
        select: {
          problemId: true, title: true, difficultyLevel: true,
          category: true, createdBy: true, createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.problem.count({ where }),
    ]);

    return { items, total };
  }

  async getProblem(id: number) {
    const problem = await this.prisma.problem.findUnique({
      where: { problemId: id },
      include: {
        testCases: { orderBy: { testCaseId: 'asc' } },
        solutions: { orderBy: { language: 'asc' } },
      },
    });
    return problem;
  }

  async deleteProblem(id: number): Promise<boolean> {
    try {
      await this.prisma.problem.delete({ where: { problemId: id } });
      return true;
    } catch {
      return false;
    }
  }

  async getCategories(): Promise<string[]> {
    const result = await this.prisma.problem.findMany({
      select: { category: true },
      distinct: ['category'],
      where: { category: { not: null } },
      orderBy: { category: 'asc' },
    });
    return result.map((r: { category: string | null }) => r.category!).filter(Boolean);
  }

  async getDifficultyLevels(): Promise<string[]> {
    const result = await this.prisma.problem.findMany({
      select: { difficultyLevel: true },
      distinct: ['difficultyLevel'],
      where: { difficultyLevel: { not: null } },
      orderBy: { difficultyLevel: 'asc' },
    });
    return result.map((r: { difficultyLevel: string | null }) => r.difficultyLevel!).filter(Boolean);
  }

  async getRandomProblems(language: string, difficulty: string, maxProblems: number) {
    // PostgreSQL: ORDER BY RANDOM() replaces MSSQL ORDER BY NEWID()
    // Prisma doesn't support ORDER BY RANDOM() natively; use safe parameterised raw query
    if (difficulty !== 'Mixed') {
      return this.prisma.$queryRaw<any[]>`
        SELECT p.* FROM problems p
        INNER JOIN problem_solutions s ON p.problem_id = s.problem_id
        WHERE s.language = ${language}
          AND p.difficulty_level = ${difficulty}
        ORDER BY RANDOM()
        LIMIT ${maxProblems}
      `;
    }

    return this.prisma.$queryRaw<any[]>`
      SELECT p.* FROM problems p
      INNER JOIN problem_solutions s ON p.problem_id = s.problem_id
      WHERE s.language = ${language}
      ORDER BY RANDOM()
      LIMIT ${maxProblems}
    `;
  }
}





