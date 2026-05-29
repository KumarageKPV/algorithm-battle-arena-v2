using AlgorithmBattleArena.Models;
using AlgorithmBattleArena.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AlgorithmBattleArena.Repositories
{
    public interface IMatchRepository
    {
        Task<Match> CreateMatch(int lobbyId, IEnumerable<int> problemIds);
        Task<IEnumerable<LeaderboardEntryDto>> GetMatchLeaderboard(int matchId);
        Task<IEnumerable<LeaderboardEntryDto>> GetGlobalLeaderboard();
    }
}
