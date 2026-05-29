using AlgorithmBattleArena.Hubs;
using AlgorithmBattleArena.Models;
using AlgorithmBattleArena.Repositories;
using AlgorithmBattleArena.Dtos;
using AlgorithmBattleArena.Attributes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using AlgorithmBattleArena.Helpers;

namespace AlgorithmBattleArena.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Must be authenticated (JWT)
    public class MatchesController : ControllerBase
    {
        private readonly IHubContext<MatchHub> _hubContext;
        private readonly ILobbyRepository _lobbyRepository;
        private readonly IMatchRepository _matchRepository;
        private readonly IChatRepository _chatRepository;
        private readonly AuthHelper _authHelper;

        public MatchesController(IHubContext<MatchHub> hubContext, ILobbyRepository lobbyRepository, IMatchRepository matchRepository, IChatRepository chatRepository, AuthHelper authHelper)
        {
            _hubContext = hubContext;
            _lobbyRepository = lobbyRepository;
            _matchRepository = matchRepository;
            _chatRepository = chatRepository;
            _authHelper = authHelper;
        }

        /// <summary>
        /// Start a match for the given lobbyId.
        /// The caller must be the host for that lobby (IsHost check).
        /// Broadcasts a single MatchStarted DTO to the lobby group.
        /// </summary>
        [StudentOrAdmin]
        [HttpPost("{lobbyId:int}/start")]
        public async Task<IActionResult> StartMatch(int lobbyId, [FromBody] StartMatchRequest request)
        {
            var userEmail = _authHelper.GetEmailFromClaims(User);
            if (string.IsNullOrEmpty(userEmail) || !await _lobbyRepository.IsHost(lobbyId, userEmail))
            {
                return Forbid("Only the host can start the match.");
            }

            var match = await _matchRepository.CreateMatch(lobbyId, request.ProblemIds);
            
            // Create match chat conversation
            var lobby = await _lobbyRepository.GetLobbyById(lobbyId);
            if (lobby != null)
            {
                try
                {
                    var participantEmails = lobby.Participants.Select(p => p.ParticipantEmail).ToList();
                    await _chatRepository.CreateConversationAsync("Match", match.MatchId, participantEmails);
                }
                catch (Exception chatEx)
                {
                    // Log but don't fail match creation if chat fails
                    Console.WriteLine($"Failed to create match chat: {chatEx.Message}");
                }
            }

            var bufferSec = Math.Max(1, request.PreparationBufferSec);
            var startAtUtc = DateTime.UtcNow.AddSeconds(bufferSec);

            var dto = new MatchStartedDto
            {
                MatchId = match.MatchId,
                ProblemIds = request.ProblemIds,
                StartAtUtc = startAtUtc,
                DurationSec = request.DurationSec,
                SentAtUtc = DateTime.UtcNow
            };

            Console.WriteLine($"Broadcasting MatchStarted to lobby group {lobbyId} with {dto.ProblemIds.Count} problems");
            await _hubContext.Clients.Group(lobbyId.ToString()).SendAsync("MatchStarted", dto);
            Console.WriteLine($"MatchStarted broadcast sent to lobby group {lobbyId}");

            await _lobbyRepository.UpdateLobbyStatus(lobbyId, "InProgress");

            return Ok(dto);
        }

        [HttpGet("{matchId:int}/leaderboard")]
        public async Task<IActionResult> GetMatchLeaderboard(int matchId)
        {
            var leaderboard = await _matchRepository.GetMatchLeaderboard(matchId);
            return Ok(leaderboard);
        }

        [HttpGet("leaderboard/global")]
        public async Task<IActionResult> GetGlobalLeaderboard()
        {
            var leaderboard = await _matchRepository.GetGlobalLeaderboard();
            return Ok(leaderboard);
        }
    }
}
