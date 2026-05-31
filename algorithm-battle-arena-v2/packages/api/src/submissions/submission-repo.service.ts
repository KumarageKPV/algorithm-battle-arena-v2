import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CodeExecutionService } from '../code-execution/code-execution.service';

/**
 * Port of C# SubmissionRepository — simple CRUD.
 */
@Injectable()
export class SubmissionRepoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly codeExecution: CodeExecutionService,
  ) {}

  async createSubmission(data: {
    matchId: number; problemId: number; participantEmail: string;
    language: string; code: string; status: string; score?: number;
  }) {
    const existing = await this.prisma.submission.findFirst({
      where: {
        matchId: data.matchId,
        problemId: data.problemId,
        participantEmail: data.participantEmail,
      },
      select: { submissionId: true },
    });
    if (existing) {
      throw new ConflictException('You have already submitted this problem for this match.');
    }

    const matchProblem = await this.prisma.matchProblem.findFirst({
      where: { matchId: data.matchId, problemId: data.problemId },
    });
    if (!matchProblem) {
      throw new BadRequestException('Problem is not part of this match.');
    }

    const problem = await this.prisma.problem.findUnique({
      where: { problemId: data.problemId },
      include: { testCases: { orderBy: { testCaseId: 'asc' } } },
    });
    const testCases = (problem?.testCases ?? []).map((tc) => ({
      inputData: tc.inputData ?? '',
      expectedOutput: tc.expectedOutput ?? '',
    }));
    if (testCases.length === 0) {
      throw new BadRequestException('Problem has no test cases.');
    }

    const run = await this.codeExecution.runTestCases(data.code, data.language, testCases);
    const submission = await this.prisma.submission.create({
      data: {
        matchId: data.matchId,
        problemId: data.problemId,
        participantEmail: data.participantEmail,
        language: data.language,
        code: data.code,
        status: data.status,
        score: run.score,
      },
    });
    return {
      submissionId: submission.submissionId,
      score: run.score,
      passedCount: run.passedCount,
      totalCount: run.totalCount,
      results: run.testCaseResults.map((r: any, index: number) => ({
        ...r,
        input: testCases[index]?.inputData ?? '',
        expectedOutput: testCases[index]?.expectedOutput ?? r.expectedOutput,
      })),
    };
  }

  async getSubmissionsByMatchAndUser(matchId: number, userEmail: string) {
    return this.prisma.submission.findMany({
      where: { matchId, participantEmail: userEmail },
      orderBy: { submittedAt: 'desc' },
    });
  }
}
