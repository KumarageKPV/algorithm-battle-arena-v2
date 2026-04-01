import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Port of C# SubmissionRepository — simple CRUD.
 */
@Injectable()
export class SubmissionRepoService {
  constructor(private readonly prisma: PrismaService) {}

  async createSubmission(data: {
    matchId: number; problemId: number; participantEmail: string;
    language: string; code: string; status: string; score?: number;
  }): Promise<number> {
    const submission = await this.prisma.submission.create({
      data: {
        matchId: data.matchId,
        problemId: data.problemId,
        participantEmail: data.participantEmail,
        language: data.language,
        code: data.code,
        status: data.status,
        score: data.score ?? null,
      },
    });
    return submission.submissionId;
  }

  async getSubmissionsByMatchAndUser(matchId: number, userEmail: string) {
    return this.prisma.submission.findMany({
      where: { matchId, participantEmail: userEmail },
      orderBy: { submittedAt: 'desc' },
    });
  }
}

