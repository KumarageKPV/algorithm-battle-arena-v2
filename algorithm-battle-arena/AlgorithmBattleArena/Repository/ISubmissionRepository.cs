using AlgorithmBattleArena.Models;
using System.Threading.Tasks;

namespace AlgorithmBattleArena.Repositories
{
    public interface ISubmissionRepository
    {
        Task<int> CreateSubmission(Submission submission);
        Task<IEnumerable<Submission>> GetSubmissionsByMatchAndUser(int matchId, string userEmail);
    }
}
