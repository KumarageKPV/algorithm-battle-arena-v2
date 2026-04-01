import {
  Controller, Get, Post, Body, Param, UseGuards, Request,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { SubmissionRepoService } from './submission-repo.service';
import { CreateSubmissionDto } from './dto/submissions.dto';

/**
 * Port of C# SubmissionsController — /api/Submissions (2 endpoints).
 */
@Controller('api/Submissions')
@UseGuards(JwtAuthGuard)
export class SubmissionsController {
  constructor(private readonly submissionRepo: SubmissionRepoService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async createSubmission(@Body() body: CreateSubmissionDto, @Request() req: any) {
    const submissionId = await this.submissionRepo.createSubmission({
      matchId: body.matchId,
      problemId: body.problemId,
      participantEmail: req.user.email,
      language: body.language,
      code: body.code,
      status: body.status || 'Submitted',
      score: body.score,
    });
    return { SubmissionId: submissionId };
  }

  @Get('match/:matchId/user')
  async getUserSubmissions(@Param('matchId') matchId: string, @Request() req: any) {
    return this.submissionRepo.getSubmissionsByMatchAndUser(parseInt(matchId, 10), req.user.email);
  }
}

