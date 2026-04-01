/** Port of C# UserStatisticsDto — response shape for GET /api/Statistics/user */
export interface UserStatisticsDto {
  email: string;
  fullName: string;
  rank: number;
  matchesPlayed: number;
  winRate: number;
  problemsCompleted: number;
  totalScore: number;
  lastActivity: Date | null;
}

/** Port of C# LeaderboardEntryDto — response shape for GET /api/Statistics/leaderboard */
export interface LeaderboardEntryDto {
  rank: number;
  participantEmail: string;
  fullName: string;
  totalScore: number;
  problemsCompleted: number;
  matchesPlayed: number;
  winRate: number;
  lastSubmission: Date | null;
}

