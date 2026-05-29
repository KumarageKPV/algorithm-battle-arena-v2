using AlgorithmBattleArena.Dtos;

namespace AlgorithmBattleArena.Repositories
{
    public interface IStatisticsRepository
    {
        Task<UserStatisticsDto> GetUserStatistics(string userEmail);
        Task<IEnumerable<LeaderboardEntryDto>> GetLeaderboard();
    }
}
