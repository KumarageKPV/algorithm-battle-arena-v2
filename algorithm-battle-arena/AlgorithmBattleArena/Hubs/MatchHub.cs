using AlgorithmBattleArena.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using AlgorithmBattleArena.Helpers;

namespace AlgorithmBattleArena.Hubs
{
    [Authorize]
    public class MatchHub : Hub
    {
        private readonly ILobbyRepository _lobbyRepository;
        private readonly AuthHelper _authHelper;

        public MatchHub(ILobbyRepository lobbyRepository, AuthHelper authHelper)
        {
            _lobbyRepository = lobbyRepository;
            _authHelper = authHelper;
        }

        private string? GetUserEmail()
        {
            if (Context.User == null) return null;
            return _authHelper.GetEmailFromClaims(Context.User);
        }

        public override Task OnConnectedAsync()
        {
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception? exception)
        {
            // Client should handle calling LeaveLobby explicitly before disconnecting.
            // This is for cleanup if the disconnect is abrupt.
            return base.OnDisconnectedAsync(exception);
        }

        public async Task JoinLobby(string lobbyId)
        {
            if (!int.TryParse(lobbyId, out int lobbyIdInt)){
                throw new HubException("Invalid lobby ID.");
            }

            var userEmail = GetUserEmail();
            if (string.IsNullOrEmpty(userEmail))
                throw new HubException("User not authenticated");

            Console.WriteLine($"SignalR: User {userEmail} joining lobby group {lobbyId}");
            await Groups.AddToGroupAsync(Context.ConnectionId, lobbyId);
            Console.WriteLine($"SignalR: User {userEmail} successfully joined lobby group {lobbyId}");
            await BroadcastLobbyUpdate(lobbyIdInt);
        }

        public async Task LeaveLobby(string lobbyId)
        {
            if (!int.TryParse(lobbyId, out int lobbyIdInt)){
                throw new HubException("Invalid lobby ID.");
            }

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, lobbyId);
            await BroadcastLobbyUpdate(lobbyIdInt);
        }

        private async Task BroadcastLobbyUpdate(int lobbyId)
        {
            var lobby = await _lobbyRepository.GetLobbyById(lobbyId);
            if (lobby != null)
            {
                await Clients.Group(lobbyId.ToString()).SendAsync("LobbyUpdated", lobby);
            }
        }
    }
}
