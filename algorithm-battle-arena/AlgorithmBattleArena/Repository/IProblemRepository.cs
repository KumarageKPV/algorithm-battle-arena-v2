using AlgorithmBattleArena.Dtos;
using AlgorithmBattleArena.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using AlgorithmBattleArena.Helpers;

namespace AlgorithmBattleArena.Repositories
{
    public interface IProblemRepository
    {
        Task<int> UpsertProblem(ProblemUpsertDto dto);
        Task<PagedResult<ProblemListDto>> GetProblems(ProblemFilterDto filter);
        Task<ProblemResponseDto?> GetProblem(int id);
        Task<bool> DeleteProblem(int id);
        Task<IEnumerable<string>> GetCategories();
        Task<IEnumerable<string>> GetDifficultyLevels();
        Task<IEnumerable<Problem>> GetRandomProblems(string language, string difficulty, int maxProblems);
        Task<int> ImportProblemsAsync(IEnumerable<Problem> problems);
        Task<bool> SlugExistsAsync(string slug);
    }
}
