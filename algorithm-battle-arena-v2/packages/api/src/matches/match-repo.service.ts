import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface LeaderboardEntryDto {
  rank: number;
  participantEmail: string;
  fullName?: string;
  totalScore: number;
  problemsCompleted: number;
  matchesPlayed: number;
  winRate: number;
  lastSubmission: Date | null;
}

/**
 * Port of C# MatchRepository.
 */
@Injectable()
export class MatchRepoService {
  private readonly logger = new Logger(MatchRepoService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createMatch(lobbyId: number, problemIds: number[]) {
    const match = await this.prisma.match.create({
      data: { lobbyId },
    });

    if (problemIds.length > 0) {
      await this.prisma.matchProblem.createMany({
        data: problemIds.map((problemId) => ({
          matchId: match.matchId,
          problemId,
        })),
      });
    }

    return match;
  }

  async getMatchLeaderboard(matchId: number): Promise<LeaderboardEntryDto[]> {
    // PostgreSQL: ISNULL → COALESCE, ROW_NUMBER window function works the same
    const results = await this.prisma.$queryRaw<LeaderboardEntryDto[]>`
      WITH BestSubmissions AS (
        SELECT
          participant_email,
          problem_id,
          MAX(score) as best_score,
          MAX(submitted_at) as last_submission
        FROM submissions
        WHERE match_id = ${matchId}
        GROUP BY participant_email, problem_id
      ),
      ParticipantStats AS (
        SELECT
          participant_email,
          SUM(best_score) as total_score,
          COUNT(*) as problems_completed,
          MAX(last_submission) as last_submission
        FROM BestSubmissions
        GROUP BY participant_email
      ),
      GlobalStats AS (
        SELECT
          s.participant_email,
          COUNT(DISTINCT s.match_id) as matches_played,
          COUNT(CASE WHEN s.score >= 70 THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0) as win_rate
        FROM submissions s
        GROUP BY s.participant_email
      )
      SELECT
        ROW_NUMBER() OVER (ORDER BY ps.total_score DESC, ps.last_submission ASC) as rank,
        ps.participant_email as "participantEmail",
        ps.total_score as "totalScore",
        ps.problems_completed as "problemsCompleted",
        COALESCE(gs.matches_played, 0) as "matchesPlayed",
        COALESCE(gs.win_rate, 0) as "winRate",
        ps.last_submission as "lastSubmission"
      FROM ParticipantStats ps
      LEFT JOIN GlobalStats gs ON ps.participant_email = gs.participant_email
      ORDER BY ps.total_score DESC, ps.last_submission ASC
    `;

    return results;
  }

  async getGlobalLeaderboard(): Promise<LeaderboardEntryDto[]> {
    const results = await this.prisma.$queryRaw<LeaderboardEntryDto[]>`
      WITH ParticipantStats AS (
        SELECT
          s.participant_email,
          COUNT(DISTINCT s.match_id) as matches_played,
          AVG(CAST(s.score as FLOAT)) as avg_score,
          COUNT(CASE WHEN s.score >= 70 THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0) as win_rate,
          COUNT(DISTINCT s.problem_id) as problems_completed,
          MAX(s.submitted_at) as last_submission
        FROM submissions s
        GROUP BY s.participant_email
      )
      SELECT
        ROW_NUMBER() OVER (ORDER BY ps.avg_score DESC, ps.matches_played DESC) as rank,
        ps.participant_email as "participantEmail",
        CAST(ps.avg_score as INT) as "totalScore",
        ps.problems_completed as "problemsCompleted",
        ps.matches_played as "matchesPlayed",
        ps.win_rate as "winRate",
        ps.last_submission as "lastSubmission"
      FROM ParticipantStats ps
      ORDER BY ps.avg_score DESC, ps.matches_played DESC
    `;

    return results;
  }
}

