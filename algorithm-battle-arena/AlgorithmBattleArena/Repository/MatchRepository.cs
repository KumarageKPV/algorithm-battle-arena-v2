using AlgorithmBattleArena.Data;
using AlgorithmBattleArena.Models;
using AlgorithmBattleArena.Dtos;
using Dapper;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AlgorithmBattleArena.Repositories
{
    public class MatchRepository : IMatchRepository
    {
        private readonly IDataContextDapper _dapper;

        public MatchRepository(IDataContextDapper dapper)
        {
            _dapper = dapper;
        }

        public async Task<Match> CreateMatch(int lobbyId, IEnumerable<int> problemIds)
        {
            var matchSql = @"INSERT INTO AlgorithmBattleArinaSchema.Matches (LobbyId) VALUES (@LobbyId);
                           SELECT CAST(SCOPE_IDENTITY() as int)";
            var matchId = await _dapper.LoadDataSingleAsync<int>(matchSql, new { LobbyId = lobbyId });

            if (problemIds.Any())
            {
                var matchProblemsSql = "INSERT INTO AlgorithmBattleArinaSchema.MatchProblems (MatchId, ProblemId) VALUES (@MatchId, @ProblemId)";
                foreach (var problemId in problemIds)
                {
                    await _dapper.ExecuteSqlAsync(matchProblemsSql, new { MatchId = matchId, ProblemId = problemId });
                }
            }

            return new Match { MatchId = matchId, LobbyId = lobbyId, StartedAt = System.DateTime.UtcNow };
        }

        public async Task<IEnumerable<LeaderboardEntryDto>> GetMatchLeaderboard(int matchId)
        {
            var sql = @"
                WITH BestSubmissions AS (
                    SELECT 
                        ParticipantEmail,
                        ProblemId,
                        MAX(Score) as BestScore,
                        MAX(SubmittedAt) as LastSubmission
                    FROM AlgorithmBattleArinaSchema.Submissions 
                    WHERE MatchId = @MatchId
                    GROUP BY ParticipantEmail, ProblemId
                ),
                ParticipantStats AS (
                    SELECT 
                        ParticipantEmail,
                        SUM(BestScore) as TotalScore,
                        COUNT(*) as ProblemsCompleted,
                        MAX(LastSubmission) as LastSubmission
                    FROM BestSubmissions
                    GROUP BY ParticipantEmail
                ),
                GlobalStats AS (
                    SELECT 
                        s.ParticipantEmail,
                        COUNT(DISTINCT s.MatchId) as MatchesPlayed,
                        COUNT(CASE WHEN s.Score >= 70 THEN 1 END) * 100.0 / COUNT(*) as WinRate
                    FROM AlgorithmBattleArinaSchema.Submissions s
                    GROUP BY s.ParticipantEmail
                )
                SELECT 
                    ROW_NUMBER() OVER (ORDER BY ps.TotalScore DESC, ps.LastSubmission ASC) as Rank,
                    ps.ParticipantEmail,
                    ps.TotalScore,
                    ps.ProblemsCompleted,
                    ISNULL(gs.MatchesPlayed, 0) as MatchesPlayed,
                    ISNULL(gs.WinRate, 0) as WinRate,
                    ps.LastSubmission
                FROM ParticipantStats ps
                LEFT JOIN GlobalStats gs ON ps.ParticipantEmail = gs.ParticipantEmail
                ORDER BY ps.TotalScore DESC, ps.LastSubmission ASC";

            return await _dapper.LoadDataAsync<LeaderboardEntryDto>(sql, new { MatchId = matchId });
        }

        public async Task<IEnumerable<LeaderboardEntryDto>> GetGlobalLeaderboard()
        {
            var sql = @"
                WITH ParticipantStats AS (
                    SELECT 
                        s.ParticipantEmail,
                        COUNT(DISTINCT s.MatchId) as MatchesPlayed,
                        AVG(CAST(s.Score as FLOAT)) as AvgScore,
                        COUNT(CASE WHEN s.Score >= 70 THEN 1 END) * 100.0 / COUNT(*) as WinRate,
                        COUNT(DISTINCT s.ProblemId) as ProblemsCompleted,
                        MAX(s.SubmittedAt) as LastSubmission
                    FROM AlgorithmBattleArinaSchema.Submissions s
                    GROUP BY s.ParticipantEmail
                )
                SELECT 
                    ROW_NUMBER() OVER (ORDER BY ps.AvgScore DESC, ps.MatchesPlayed DESC) as Rank,
                    ps.ParticipantEmail,
                    CAST(ps.AvgScore as INT) as TotalScore,
                    ps.ProblemsCompleted,
                    ps.MatchesPlayed,
                    ps.WinRate,
                    ps.LastSubmission
                FROM ParticipantStats ps
                ORDER BY ps.AvgScore DESC, ps.MatchesPlayed DESC";

            return await _dapper.LoadDataAsync<LeaderboardEntryDto>(sql);
        }
    }
}
