using AlgorithmBattleArena.Dtos;
using AlgorithmBattleArena.Models;

namespace AlgorithmBattleArena.Repositories
{
    public interface IChatRepository
    {
        Task<int> CreateConversationAsync(string type, int? referenceId, List<string> participantEmails);
        Task AddParticipantsToConversationAsync(int conversationId, List<string> participantEmails);
        Task<IEnumerable<ConversationDto>> GetConversationsAsync(string userEmail);
        Task<ConversationDto?> GetConversationAsync(int conversationId);
        Task<int> SendMessageAsync(int conversationId, string senderEmail, string content);
        Task<IEnumerable<MessageDto>> GetMessagesAsync(int conversationId, int pageSize = 50, int offset = 0);
        Task<bool> IsParticipantAsync(int conversationId, string userEmail);
        Task<ConversationDto?> GetFriendConversationAsync(string user1Email, string user2Email);
        Task<ConversationDto?> GetLobbyConversationAsync(int lobbyId);
        Task<ConversationDto?> GetMatchConversationAsync(int matchId);
    }
}
