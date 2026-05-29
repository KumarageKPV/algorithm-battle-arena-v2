using AlgorithmBattleArena.Data;
using AlgorithmBattleArena.Models;
using Dapper;
using System.Threading.Tasks;

namespace AlgorithmBattleArena.Repositories
{
    public class SubmissionRepository : ISubmissionRepository
    {
        private readonly IDataContextDapper _dapper;

        public SubmissionRepository(IDataContextDapper dapper)
        {
            _dapper = dapper;
        }

        public async Task<int> CreateSubmission(Submission submission)
        {
            var sql = @"INSERT INTO AlgorithmBattleArinaSchema.Submissions (MatchId, ProblemId, ParticipantEmail, Language, Code, Status, Score) 
                        VALUES (@MatchId, @ProblemId, @ParticipantEmail, @Language, @Code, @Status, @Score);
                        SELECT CAST(SCOPE_IDENTITY() as int)";
            
            var parameters = new DynamicParameters();
            parameters.Add("@MatchId", submission.MatchId);
            parameters.Add("@ProblemId", submission.ProblemId);
            parameters.Add("@ParticipantEmail", submission.ParticipantEmail);
            parameters.Add("@Language", submission.Language);
            parameters.Add("@Code", submission.Code);
            parameters.Add("@Status", submission.Status);
            parameters.Add("@Score", submission.Score);

            return await _dapper.LoadDataSingleAsync<int>(sql, parameters);
        }

        public async Task<IEnumerable<Submission>> GetSubmissionsByMatchAndUser(int matchId, string userEmail)
        {
            var sql = @"SELECT * FROM AlgorithmBattleArinaSchema.Submissions 
                        WHERE MatchId = @MatchId AND ParticipantEmail = @ParticipantEmail 
                        ORDER BY SubmittedAt DESC";
            
            var parameters = new DynamicParameters();
            parameters.Add("@MatchId", matchId);
            parameters.Add("@ParticipantEmail", userEmail);

            return await _dapper.LoadDataAsync<Submission>(sql, parameters);
        }
    }
}
