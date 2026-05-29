using System.Collections.Generic;
using System.Threading.Tasks;
using AlgorithmBattleArena.Models;
using AlgorithmBattleArena.Dtos;

namespace AlgorithmBattleArena.Repositories
{
    public interface IStudentRepository
    {
        Task<int> CreateRequest(int studentId, int teacherId);
        Task AcceptRequest(int requestId, int teacherId);
        Task RejectRequest(int requestId, int teacherId);
        Task<IEnumerable<StudentRequestDto>> GetStudentsByStatus(int teacherId, string status);
        Task<IEnumerable<TeacherDto>> GetAcceptedTeachers(int studentId);
        Task<StudentAnalyticsDto> GetStudentAnalytics(int teacherId, int studentId);
        Task<IEnumerable<SubmissionHistoryDto>> GetStudentSubmissionHistory(int teacherId, int studentId);
        Task<TeacherDashboardStatsDto> GetTeacherDashboardStats(int teacherId);
    }
}
