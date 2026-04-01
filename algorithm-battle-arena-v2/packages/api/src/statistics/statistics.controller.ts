import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard, StudentOrAdminGuard } from '../auth/guards';
import { StatisticsRepoService } from './statistics-repo.service';

/** Port of C# StatisticsController — /api/Statistics (2 endpoints). */
@Controller('api/Statistics')
@UseGuards(JwtAuthGuard, StudentOrAdminGuard)
export class StatisticsController {
  constructor(private readonly statsRepo: StatisticsRepoService) {}

  @Get('user')
  async getUserStatistics(@Request() req: any) {
    return this.statsRepo.getUserStatistics(req.user.email);
  }

  @Get('leaderboard')
  async getLeaderboard() {
    return this.statsRepo.getLeaderboard();
  }
}

