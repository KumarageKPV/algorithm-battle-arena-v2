using System.Threading.Tasks;
using AlgorithmBattleArena.Dtos;

namespace AlgorithmBattleArena.Services
{
    public interface IMicroCourseService
    {
        Task<object?> GenerateMicroCourseAsync(int problemId, MicroCourseRequestDto request, string userId);
    }
}
