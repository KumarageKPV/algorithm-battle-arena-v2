using AlgorithmBattleArena.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AlgorithmBattleArena.Repositories
{
    public interface ILobbyRepository
    {
        // Lobby Management
        Task<Lobby> CreateLobby(string lobbyName, int maxPlayers, string mode, string difficulty, string hostEmail, string lobbyCode);
        Task<bool> JoinLobby(int lobbyId, string participantEmail);
        Task<bool> LeaveLobby(int lobbyId, string participantEmail);
        Task<bool> KickParticipant(int lobbyId, string hostEmail, string participantEmail);
        Task<bool> CloseLobby(int lobbyId, string hostEmail);
        Task<bool> UpdateLobbyStatus(int lobbyId, string status);
        Task<bool> UpdateLobbyPrivacy(int lobbyId, bool isPublic);
        Task<bool> UpdateLobbyDifficulty(int lobbyId, string difficulty);
        Task<bool> DeleteLobby(int lobbyId);

        // Query Methods
        Task<IEnumerable<Lobby>> GetOpenLobbies();
        Task<Lobby?> GetLobbyById(int lobbyId);
        Task<Lobby?> GetLobbyByCode(string lobbyCode);
        
        // Authorization
        Task<bool> IsHost(int lobbyId, string email);
    }
}
