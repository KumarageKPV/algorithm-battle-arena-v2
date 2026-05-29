using AlgorithmBattleArena.Repositories;
using AlgorithmBattleArena.Attributes;
using AlgorithmBattleArena.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using AlgorithmBattleArena.Dtos;
using System.Threading.Tasks;
using System;
using System.Linq;
using Microsoft.AspNetCore.SignalR;
using AlgorithmBattleArena.Hubs;

namespace AlgorithmBattleArena.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LobbiesController : ControllerBase
    {
        private readonly ILobbyRepository _lobbyRepository;
        private readonly IChatRepository _chatRepository;
        private readonly AuthHelper _authHelper;
        private readonly IHubContext<MatchHub> _hubContext;

        public LobbiesController(ILobbyRepository lobbyRepository, IChatRepository chatRepository, AuthHelper authHelper, IHubContext<MatchHub> hubContext)
        {
            _lobbyRepository = lobbyRepository;
            _chatRepository = chatRepository;
            _authHelper = authHelper;
            _hubContext = hubContext;
        }

        [StudentOrAdmin]
        [HttpGet]
        public async Task<IActionResult> GetOpenLobbies()
        {
            var lobbies = await _lobbyRepository.GetOpenLobbies();
            return Ok(lobbies);
        }

        [StudentOrAdmin]
        [HttpGet("{lobbyId:int}")]
        public async Task<IActionResult> GetLobby(int lobbyId)
        {
            var lobby = await _lobbyRepository.GetLobbyById(lobbyId);
            if (lobby == null) return NotFound();
            return Ok(lobby);
        }

        [StudentOrAdmin]
        [HttpPost]
        public async Task<IActionResult> CreateLobby([FromBody] LobbyCreateDto request)
        {
            try
            {
                var hostEmail = _authHelper.GetEmailFromClaims(User);
                if (string.IsNullOrEmpty(hostEmail)) return Unauthorized();

                var lobbyCode = GenerateLobbyCode();
                var lobby = await _lobbyRepository.CreateLobby(request.Name, request.MaxPlayers, request.Mode, request.Difficulty, hostEmail, lobbyCode);
                
                if (lobby == null)
                {
                    return StatusCode(500, new { message = "Failed to create lobby" });
                }
                
                // Create lobby chat conversation
                try
                {
                    await _chatRepository.CreateConversationAsync("Lobby", lobby.LobbyId, new List<string> { hostEmail });
                }
                catch (Exception chatEx)
                {
                    // Log but don't fail lobby creation if chat fails
                    Console.WriteLine($"Failed to create lobby chat: {chatEx.Message}");
                }
                
                return CreatedAtAction(nameof(GetLobby), new { lobbyId = lobby.LobbyId }, lobby);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to create lobby", error = ex.Message });
            }
        }

        [StudentOrAdmin]
        [HttpPost("{lobbyCode}/join")]
        public async Task<IActionResult> JoinLobby(string lobbyCode)
        {
            var participantEmail = _authHelper.GetEmailFromClaims(User);
            if (string.IsNullOrEmpty(participantEmail)) return Unauthorized();

            var lobby = await _lobbyRepository.GetLobbyByCode(lobbyCode);
            if (lobby == null) return NotFound("Lobby not found");

            var success = await _lobbyRepository.JoinLobby(lobby.LobbyId, participantEmail);
            if (!success) return BadRequest("Cannot join lobby. It might be full or closed.");

            // Add participant to lobby conversation
            try
            {
                var allParticipants = new List<string> { lobby.HostEmail, participantEmail };
                await _chatRepository.CreateConversationAsync("Lobby", lobby.LobbyId, allParticipants);
            }
            catch
            {
                // Conversation might already exist, ignore error
            }

            var updatedLobby = await _lobbyRepository.GetLobbyById(lobby.LobbyId);
            await _hubContext.Clients.Group(lobby.LobbyId.ToString()).SendAsync("LobbyUpdated", updatedLobby);

            return Ok(updatedLobby);
        }

        [StudentOrAdmin]
        [HttpPost("{lobbyId:int}/leave")]
        public async Task<IActionResult> LeaveLobby(int lobbyId)
        {
            var participantEmail = _authHelper.GetEmailFromClaims(User);
            if (string.IsNullOrEmpty(participantEmail)) return Unauthorized();

            var success = await _lobbyRepository.LeaveLobby(lobbyId, participantEmail);
            if (!success) return BadRequest("Cannot leave lobby");

            var updatedLobby = await _lobbyRepository.GetLobbyById(lobbyId);
            await _hubContext.Clients.Group(lobbyId.ToString()).SendAsync("LobbyUpdated", updatedLobby);

            return Ok(new { message = "Left lobby successfully" });
        }

        [StudentOrAdmin]
        [HttpPost("{lobbyId:int}/close")]
        public async Task<IActionResult> CloseLobby(int lobbyId)
        {
            var hostEmail = _authHelper.GetEmailFromClaims(User);
            if (string.IsNullOrEmpty(hostEmail)) return Unauthorized();

            var success = await _lobbyRepository.CloseLobby(lobbyId, hostEmail);
            if (!success) return Forbid("Only the host can close the lobby.");

            var updatedLobby = await _lobbyRepository.GetLobbyById(lobbyId);
            await _hubContext.Clients.Group(lobbyId.ToString()).SendAsync("LobbyUpdated", updatedLobby);

            return Ok(new { message = "Lobby closed successfully" });
        }

        [StudentOrAdmin]
        [HttpDelete("{lobbyId:int}/participants/{participantEmail}")]
        public async Task<IActionResult> KickParticipant(int lobbyId, string participantEmail)
        {
            var hostEmail = _authHelper.GetEmailFromClaims(User);
            if (string.IsNullOrEmpty(hostEmail) || !await _lobbyRepository.IsHost(lobbyId, hostEmail))
            {
                return Forbid("Only the host can kick participants.");
            }

            var success = await _lobbyRepository.KickParticipant(lobbyId, hostEmail, participantEmail);
            if (!success) return BadRequest("Failed to kick participant.");

            var updatedLobby = await _lobbyRepository.GetLobbyById(lobbyId);
            await _hubContext.Clients.Group(lobbyId.ToString()).SendAsync("LobbyUpdated", updatedLobby);

            return Ok(new { message = "Participant kicked successfully" });
        }

        [StudentOrAdmin]
        [HttpPut("{lobbyId:int}/privacy")]
        public async Task<IActionResult> UpdateLobbyPrivacy(int lobbyId, [FromBody] UpdatePrivacyDto dto)
        {
            var hostEmail = _authHelper.GetEmailFromClaims(User);
            if (string.IsNullOrEmpty(hostEmail) || !await _lobbyRepository.IsHost(lobbyId, hostEmail))
            {
                return Forbid("Only the host can change the lobby privacy.");
            }

            var success = await _lobbyRepository.UpdateLobbyPrivacy(lobbyId, dto.IsPublic);
            if (!success) return BadRequest("Failed to update lobby privacy.");

            var updatedLobby = await _lobbyRepository.GetLobbyById(lobbyId);
            await _hubContext.Clients.Group(lobbyId.ToString()).SendAsync("LobbyUpdated", updatedLobby);

            return Ok(new { message = "Lobby privacy updated successfully" });
        }



        [StudentOrAdmin]
        [HttpPut("{lobbyId:int}/difficulty")]
        public async Task<IActionResult> UpdateLobbyDifficulty(int lobbyId, [FromBody] UpdateDifficultyDto dto)
        {
            var hostEmail = _authHelper.GetEmailFromClaims(User);
            if (string.IsNullOrEmpty(hostEmail) || !await _lobbyRepository.IsHost(lobbyId, hostEmail))
            {
                return Forbid("Only the host can change the lobby difficulty.");
            }

            var success = await _lobbyRepository.UpdateLobbyDifficulty(lobbyId, dto.Difficulty);
            if (!success) return BadRequest("Failed to update lobby difficulty.");

            var updatedLobby = await _lobbyRepository.GetLobbyById(lobbyId);
            await _hubContext.Clients.Group(lobbyId.ToString()).SendAsync("LobbyUpdated", updatedLobby);

            return Ok(new { message = "Lobby difficulty updated successfully" });
        }

        [StudentOrAdmin]
        [HttpDelete("{lobbyId:int}")]
        public async Task<IActionResult> DeleteLobby(int lobbyId)
        {
            var hostEmail = _authHelper.GetEmailFromClaims(User);
            if (string.IsNullOrEmpty(hostEmail) || !await _lobbyRepository.IsHost(lobbyId, hostEmail))
            {
                return Forbid("Only the host can delete the lobby.");
            }

            var success = await _lobbyRepository.DeleteLobby(lobbyId);
            if (!success) return BadRequest("Failed to delete lobby.");

            await _hubContext.Clients.Group(lobbyId.ToString()).SendAsync("LobbyDeleted");

            return Ok(new { message = "Lobby deleted successfully" });
        }

        private string GenerateLobbyCode()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, 6)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }
}
