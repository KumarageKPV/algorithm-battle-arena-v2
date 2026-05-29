using AlgorithmBattleArena.Data;
using AlgorithmBattleArena.Dtos;

namespace AlgorithmBattleArena.Repositories
{
    public class StatisticsRepository : IStatisticsRepository
    {
        private readonly IDataContextDapper _dapper;

        public StatisticsRepository(IDataContextDapper dapper)
        {
            _dapper = dapper;
        }

        public async Task<UserStatisticsDto> GetUserStatistics(string userEmail)
        {
            var sql = @"
                WITH UserStats AS (
                    SELECT 
                        a.Email,
                        COALESCE(s.FirstName + ' ' + s.LastName, t.FirstName + ' ' + t.LastName, a.Email) as FullName,
                        COALESCE(COUNT(DISTINCT lp.LobbyId), 0) as MatchesPlayed,
                        COALESCE(COUNT(DISTINCT sub.SubmissionId), 0) as ProblemsCompleted,
                        COALESCE(SUM(ISNULL(sub.Score, 0)), 0) as TotalScore,
                        MAX(sub.SubmittedAt) as LastActivity
                    FROM AlgorithmBattleArinaSchema.Auth a
                    LEFT JOIN AlgorithmBattleArinaSchema.Student s ON a.Email = s.Email
                    LEFT JOIN AlgorithmBattleArinaSchema.Teachers t ON a.Email = t.Email
                    LEFT JOIN AlgorithmBattleArinaSchema.LobbyParticipants lp ON a.Email = lp.ParticipantEmail
                    LEFT JOIN AlgorithmBattleArinaSchema.Submissions sub ON a.Email = sub.ParticipantEmail
                    GROUP BY a.Email, s.FirstName, s.LastName, t.FirstName, t.LastName
                ),
                AllUserRanks AS (
                    SELECT 
                        Email,
                        TotalScore,
                        ProblemsCompleted,
                        ROW_NUMBER() OVER (ORDER BY TotalScore DESC, ProblemsCompleted DESC, MatchesPlayed DESC) as Rank
                    FROM UserStats
                )
                SELECT 
                    us.Email,
                    us.FullName,
                    COALESCE(r.Rank, 999) as Rank,
                    us.MatchesPlayed,
                    CASE WHEN us.MatchesPlayed > 0 THEN CAST(us.ProblemsCompleted AS DECIMAL) / us.MatchesPlayed * 100 ELSE 0 END as WinRate,
                    us.ProblemsCompleted,
                    us.TotalScore,
                    us.LastActivity
                FROM UserStats us
                LEFT JOIN AllUserRanks r ON us.Email = r.Email
                WHERE us.Email = @Email";

            var result = await _dapper.LoadDataSingleOrDefaultAsync<UserStatisticsDto>(sql, new { Email = userEmail });
            
            return result ?? new UserStatisticsDto 
            { 
                Email = userEmail, 
                FullName = userEmail,
                Rank = 999,
                MatchesPlayed = 0,
                WinRate = 0,
                ProblemsCompleted = 0,
                TotalScore = 0
            };
        }

        public async Task<IEnumerable<LeaderboardEntryDto>> GetLeaderboard()
        {
            var sql = @"
                WITH StudentStats AS (
                    SELECT 
                        s.Email as ParticipantEmail,
                        COUNT(DISTINCT sub.MatchId) as MatchesPlayed,
                        COALESCE(SUM(sub.Score), 0) as TotalScore,
                        COUNT(CASE WHEN sub.Status = 'Accepted' THEN 1 END) as ProblemsCompleted,
                        COUNT(CASE WHEN sub.Status = 'Accepted' THEN 1 END) * 1.0 / NULLIF(COUNT(DISTINCT sub.MatchId), 0) as WinRate,
                        MAX(sub.SubmittedAt) as LastSubmission
                    FROM AlgorithmBattleArinaSchema.Student s
                    LEFT JOIN AlgorithmBattleArinaSchema.Submissions sub ON s.Email = sub.ParticipantEmail
                    WHERE s.Active = 1
                    GROUP BY s.Email
                ),
                RankedStats AS (
                    SELECT 
                        *,
                        ROW_NUMBER() OVER (ORDER BY TotalScore DESC, WinRate DESC, ProblemsCompleted DESC) as Rank
                    FROM StudentStats
                )
                SELECT 
                    Rank,
                    ParticipantEmail,
                    TotalScore,
                    ProblemsCompleted,
                    MatchesPlayed,
                    COALESCE(WinRate, 0) as WinRate,
                    COALESCE(LastSubmission, GETDATE()) as LastSubmission
                FROM RankedStats
                ORDER BY Rank";

            return await _dapper.LoadDataAsync<LeaderboardEntryDto>(sql);
        }
    }
}
