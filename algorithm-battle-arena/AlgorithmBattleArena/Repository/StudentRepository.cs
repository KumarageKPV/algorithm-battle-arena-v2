using System.Collections.Generic;
using System.Threading.Tasks;
using AlgorithmBattleArena.Data;
using AlgorithmBattleArena.Models;
using Dapper;
using AlgorithmBattleArena.Dtos;

namespace AlgorithmBattleArena.Repositories
{
    public class StudentRepository : IStudentRepository
    {
        private readonly IDataContextDapper _dapper;

        public StudentRepository(IDataContextDapper dapper)
        {
            _dapper = dapper;
        }

        public async Task<int> CreateRequest(int studentId, int teacherId)
        {
            string sql = @"INSERT INTO AlgorithmBattleArinaSchema.StudentTeacherRequests (StudentId, TeacherId, Status) VALUES (@StudentId, @TeacherId, 'Pending');
                            SELECT CAST(SCOPE_IDENTITY() as int)";
            return await _dapper.LoadDataSingleAsync<int>(sql, new { StudentId = studentId, TeacherId = teacherId });
        }

        public async Task AcceptRequest(int requestId, int teacherId)
        {
            string sql1 = @"UPDATE AlgorithmBattleArinaSchema.StudentTeacherRequests SET Status = 'Accepted' WHERE RequestId = @RequestId AND TeacherId = @TeacherId;";
            string sql2 = @"UPDATE AlgorithmBattleArinaSchema.Student SET TeacherId = @TeacherId WHERE StudentId = (SELECT StudentId FROM AlgorithmBattleArinaSchema.StudentTeacherRequests WHERE RequestId = @RequestId)";
            var sqlCommands = new List<(string, object?)> { (sql1, new { RequestId = requestId, TeacherId = teacherId }), (sql2, new { RequestId = requestId, TeacherId = teacherId }) };
            await Task.Run(() => _dapper.ExecuteTransaction(sqlCommands));
        }

        public async Task RejectRequest(int requestId, int teacherId)
        {
            string sql = @"UPDATE AlgorithmBattleArinaSchema.StudentTeacherRequests SET Status = 'Rejected' WHERE RequestId = @RequestId AND TeacherId = @TeacherId;";
            await _dapper.ExecuteSqlAsync(sql, new { RequestId = requestId, TeacherId = teacherId });
        }

        public async Task<IEnumerable<StudentRequestDto>> GetStudentsByStatus(int teacherId, string status)
        {
            if (status.ToLower() == "accepted")
            {
                string sql = @"SELECT 0 AS RequestId, s.StudentId, s.FirstName, s.LastName, s.Email, s.Email AS Username FROM AlgorithmBattleArinaSchema.Student s WHERE s.TeacherId = @TeacherId";
                return await _dapper.LoadDataAsync<StudentRequestDto>(sql, new { TeacherId = teacherId });
            }
            else
            {
                string sql = @"SELECT r.RequestId, s.StudentId, s.FirstName, s.LastName, s.Email, s.Email AS Username FROM AlgorithmBattleArinaSchema.Student s JOIN AlgorithmBattleArinaSchema.StudentTeacherRequests r ON s.StudentId = r.StudentId WHERE r.TeacherId = @TeacherId AND r.Status = @Status";
                return await _dapper.LoadDataAsync<StudentRequestDto>(sql, new { TeacherId = teacherId, Status = status });
            }
        }

        public async Task<IEnumerable<TeacherDto>> GetAcceptedTeachers(int studentId)
        {
            string sql = @"SELECT t.TeacherId, t.FirstName, t.LastName, t.Email 
                          FROM AlgorithmBattleArinaSchema.Teachers t 
                          JOIN AlgorithmBattleArinaSchema.Student s ON t.TeacherId = s.TeacherId 
                          WHERE s.StudentId = @StudentId";
            return await _dapper.LoadDataAsync<TeacherDto>(sql, new { StudentId = studentId });
        }

        public async Task<StudentAnalyticsDto> GetStudentAnalytics(int teacherId, int studentId)
        {
            // First verify student belongs to teacher
            string studentSql = @"
                SELECT StudentId, FirstName, LastName, Email 
                FROM AlgorithmBattleArinaSchema.Student 
                WHERE TeacherId = @TeacherId AND StudentId = @StudentId";
            
            var student = await _dapper.LoadDataSingleOrDefaultAsync<dynamic>(studentSql, new { TeacherId = teacherId, StudentId = studentId });
            if (student == null) return null;
            
            // Get submission statistics
            string statsSql = @"
                SELECT 
                    ISNULL(COUNT(SubmissionId), 0) AS TotalSubmissions,
                    ISNULL(SUM(CASE WHEN Score > 0 THEN 1 ELSE 0 END), 0) AS SuccessfulSubmissions,
                    ISNULL(COUNT(DISTINCT ProblemId), 0) AS ProblemsAttempted,
                    ISNULL(COUNT(DISTINCT CASE WHEN Score > 0 THEN ProblemId END), 0) AS ProblemsSolved,
                    ISNULL(COUNT(DISTINCT MatchId), 0) AS MatchesParticipated,
                    ISNULL(AVG(CAST(Score AS DECIMAL)), 0) AS AverageScore,
                    MAX(SubmittedAt) AS LastActivity
                FROM AlgorithmBattleArinaSchema.Submissions 
                WHERE ParticipantEmail = @Email";
            
            var stats = await _dapper.LoadDataSingleOrDefaultAsync<dynamic>(statsSql, new { Email = student.Email });
            
            // Get preferred language
            string langSql = @"
                SELECT TOP 1 Language 
                FROM AlgorithmBattleArinaSchema.Submissions 
                WHERE ParticipantEmail = @Email 
                GROUP BY Language 
                ORDER BY COUNT(*) DESC";
            
            var preferredLang = await _dapper.LoadDataSingleOrDefaultAsync<string>(langSql, new { Email = student.Email }) ?? "N/A";
            
            int totalSubs = stats?.TotalSubmissions ?? 0;
            int successSubs = stats?.SuccessfulSubmissions ?? 0;
            decimal successRate = totalSubs > 0 ? (decimal)successSubs / totalSubs * 100 : 0;
            
            return new StudentAnalyticsDto
            {
                StudentId = student.StudentId,
                StudentName = $"{student.FirstName} {student.LastName}",
                Email = student.Email,
                TotalSubmissions = totalSubs,
                SuccessfulSubmissions = successSubs,
                SuccessRate = successRate,
                ProblemsAttempted = stats?.ProblemsAttempted ?? 0,
                ProblemsSolved = stats?.ProblemsSolved ?? 0,
                MatchesParticipated = stats?.MatchesParticipated ?? 0,
                AverageScore = stats?.AverageScore ?? 0,
                PreferredLanguage = preferredLang,
                LastActivity = stats?.LastActivity ?? DateTime.MinValue
            };
        }

        public async Task<IEnumerable<SubmissionHistoryDto>> GetStudentSubmissionHistory(int teacherId, int studentId)
        {
            string sql = @"
                SELECT 
                    sub.SubmissionId,
                    p.Title AS ProblemTitle,
                    sub.Language,
                    sub.Status,
                    sub.Score,
                    sub.SubmittedAt,
                    p.DifficultyLevel
                FROM AlgorithmBattleArinaSchema.Submissions sub
                JOIN AlgorithmBattleArinaSchema.Problems p ON sub.ProblemId = p.ProblemId
                JOIN AlgorithmBattleArinaSchema.Student s ON sub.ParticipantEmail = s.Email
                WHERE s.TeacherId = @TeacherId AND s.StudentId = @StudentId
                ORDER BY sub.SubmittedAt DESC";
            
            return await _dapper.LoadDataAsync<SubmissionHistoryDto>(sql, new { TeacherId = teacherId, StudentId = studentId });
        }

        public async Task<TeacherDashboardStatsDto> GetTeacherDashboardStats(int teacherId)
        {
            // Get basic student count
            string studentCountSql = @"
                SELECT COUNT(*) AS TotalStudents 
                FROM AlgorithmBattleArinaSchema.Student 
                WHERE TeacherId = @TeacherId";
            
            var totalStudents = await _dapper.LoadDataSingleAsync<int>(studentCountSql, new { TeacherId = teacherId });
            
            // Get submission statistics
            string submissionStatsSql = @"
                SELECT 
                    COUNT(DISTINCT s.StudentId) AS ActiveStudents,
                    COUNT(sub.SubmissionId) AS TotalSubmissions,
                    ISNULL(SUM(CASE WHEN sub.Score > 0 THEN 1 ELSE 0 END), 0) AS SuccessfulSubmissions
                FROM AlgorithmBattleArinaSchema.Student s
                LEFT JOIN AlgorithmBattleArinaSchema.Submissions sub ON s.Email = sub.ParticipantEmail 
                    AND sub.SubmittedAt >= DATEADD(day, -7, GETDATE())
                WHERE s.TeacherId = @TeacherId";
            
            var submissionStats = await _dapper.LoadDataSingleAsync<dynamic>(submissionStatsSql, new { TeacherId = teacherId });
            
            int totalSubs = submissionStats.TotalSubmissions;
            int successSubs = submissionStats.SuccessfulSubmissions;
            decimal successRate = totalSubs > 0 ? (decimal)successSubs / totalSubs * 100 : 0;
            
            // Get top performers (students with submissions only)
            string topPerformersSql = @"
                SELECT TOP 5
                    s.StudentId,
                    s.FirstName + ' ' + s.LastName AS StudentName,
                    s.Email,
                    COUNT(sub.SubmissionId) AS TotalSubmissions,
                    SUM(CASE WHEN sub.Score > 0 THEN 1 ELSE 0 END) AS SuccessfulSubmissions,
                    CASE WHEN COUNT(sub.SubmissionId) > 0 
                         THEN CAST(SUM(CASE WHEN sub.Score > 0 THEN 1 ELSE 0 END) AS DECIMAL) / COUNT(sub.SubmissionId) * 100 
                         ELSE 0 END AS SuccessRate,
                    AVG(CAST(sub.Score AS DECIMAL)) AS AverageScore
                FROM AlgorithmBattleArinaSchema.Student s
                INNER JOIN AlgorithmBattleArinaSchema.Submissions sub ON s.Email = sub.ParticipantEmail
                WHERE s.TeacherId = @TeacherId
                GROUP BY s.StudentId, s.FirstName, s.LastName, s.Email
                HAVING COUNT(sub.SubmissionId) > 0
                ORDER BY SuccessRate DESC, AverageScore DESC";
            
            var topPerformers = await _dapper.LoadDataAsync<dynamic>(topPerformersSql, new { TeacherId = teacherId });
            
            return new TeacherDashboardStatsDto
            {
                TotalStudents = totalStudents,
                ActiveStudents = submissionStats.ActiveStudents,
                TotalSubmissions = totalSubs,
                OverallSuccessRate = successRate,
                TopPerformers = topPerformers.Select(tp => new StudentAnalyticsDto
                {
                    StudentId = tp.StudentId,
                    StudentName = tp.StudentName,
                    Email = tp.Email,
                    TotalSubmissions = tp.TotalSubmissions,
                    SuccessfulSubmissions = tp.SuccessfulSubmissions,
                    SuccessRate = tp.SuccessRate,
                    AverageScore = tp.AverageScore ?? 0
                }).ToList()
            };
        }
    }
}
