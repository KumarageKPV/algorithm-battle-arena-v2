import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** Port of C# StatisticsRepository. */
@Injectable()
export class StatisticsRepoService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserStatistics(email: string) {
    const stats = await this.prisma.$queryRaw<any[]>`
      WITH UserStats AS (
        SELECT
          s.participant_email,
          COUNT(DISTINCT s.match_id) as matches_played,
          COUNT(CASE WHEN s.score >= 70 THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0) as win_rate,
          COUNT(DISTINCT s.problem_id) as problems_completed,
          COALESCE(SUM(s.score), 0) as total_score,
          MAX(s.submitted_at) as last_activity
        FROM submissions s
        WHERE s.participant_email = ${email}
        GROUP BY s.participant_email
      ),
      UserRank AS (
        SELECT
          participant_email,
          ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(score), 0) DESC) as rank
        FROM submissions
        GROUP BY participant_email
      )
      SELECT
        ${email} as "email",
        COALESCE(ur.rank, 0) as "rank",
        COALESCE(us.matches_played, 0) as "matchesPlayed",
        COALESCE(us.win_rate, 0) as "winRate",
        COALESCE(us.problems_completed, 0) as "problemsCompleted",
        COALESCE(us.total_score, 0) as "totalScore",
        us.last_activity as "lastActivity"
      FROM (SELECT 1) dummy
      LEFT JOIN UserStats us ON us.participant_email = ${email}
      LEFT JOIN UserRank ur ON ur.participant_email = ${email}
    `;

    // Get student/teacher name
    const student = await this.prisma.student.findUnique({ where: { email } });
    const teacher = !student ? await this.prisma.teacher.findUnique({ where: { email } }) : null;
    const fullName = student
      ? `${student.firstName} ${student.lastName}`
      : teacher
        ? `${teacher.firstName} ${teacher.lastName}`
        : email;

    const s = stats[0] || {};
    return {
      email,
      fullName,
      rank: Number(s.rank) || 0,
      matchesPlayed: Number(s.matchesPlayed) || 0,
      winRate: Number(s.winRate) || 0,
      problemsCompleted: Number(s.problemsCompleted) || 0,
      totalScore: Number(s.totalScore) || 0,
      lastActivity: s.lastActivity || null,
    };
  }

  async getLeaderboard() {
    return this.prisma.$queryRaw<any[]>`
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
        ROW_NUMBER() OVER (ORDER BY ps.avg_score DESC, ps.matches_played DESC) as "rank",
        ps.participant_email as "participantEmail",
        COALESCE(st.first_name || ' ' || st.last_name, t.first_name || ' ' || t.last_name, ps.participant_email) as "fullName",
        CAST(COALESCE(ps.avg_score, 0) as INT) as "totalScore",
        ps.problems_completed as "problemsCompleted",
        ps.matches_played as "matchesPlayed",
        COALESCE(ps.win_rate, 0) as "winRate",
        ps.last_submission as "lastSubmission"
      FROM ParticipantStats ps
      LEFT JOIN student st ON ps.participant_email = st.email
      LEFT JOIN teachers t ON ps.participant_email = t.email
      ORDER BY ps.avg_score DESC, ps.matches_played DESC
    `;
  }
}

