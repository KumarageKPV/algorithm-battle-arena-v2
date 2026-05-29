using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AlgorithmBattleArena.Attributes;
using AlgorithmBattleArena.Helpers;
using AlgorithmBattleArena.Repositories;

namespace AlgorithmBattleArena.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StatisticsController : ControllerBase
    {
        private readonly IStatisticsRepository _statisticsRepository;
        private readonly AuthHelper _authHelper;

        public StatisticsController(IStatisticsRepository statisticsRepository, AuthHelper authHelper)
        {
            _statisticsRepository = statisticsRepository;
            _authHelper = authHelper;
        }

        [StudentOrAdmin]
        [HttpGet("user")]
        public async Task<IActionResult> GetUserStatistics()
        {
            try
            {
                var userEmail = _authHelper.GetEmailFromClaims(User);
                if (string.IsNullOrEmpty(userEmail)) return Unauthorized();

                var stats = await _statisticsRepository.GetUserStatistics(userEmail);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to get user statistics", error = ex.Message });
            }
        }

        [StudentOrAdmin]
        [HttpGet("leaderboard")]
        public async Task<IActionResult> GetLeaderboard()
        {
            try
            {
                var leaderboard = await _statisticsRepository.GetLeaderboard();
                return Ok(leaderboard);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to get leaderboard", error = ex.Message });
            }
        }
    }
}
