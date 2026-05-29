using AlgorithmBattleArena.Dtos;

namespace AlgorithmBattleArena.Repositories
{
    public interface IFriendsRepository
    {
        Task<IEnumerable<FriendDto>> GetFriendsAsync(int studentId);
        Task<IEnumerable<FriendDto>> SearchStudentsAsync(string query, int currentStudentId);
        Task<int> SendFriendRequestAsync(int senderId, int receiverId);
        Task<IEnumerable<FriendRequestDto>> GetReceivedRequestsAsync(int studentId);
        Task<IEnumerable<FriendRequestDto>> GetSentRequestsAsync(int studentId);
        Task<FriendRequestDto?> GetFriendRequestAsync(int requestId);
        Task AcceptFriendRequestAsync(int requestId, int studentId);
        Task RejectFriendRequestAsync(int requestId, int studentId);
        Task RemoveFriendAsync(int studentId, int friendId);
        Task<(string senderEmail, string receiverEmail)?> GetFriendRequestEmailsAsync(int requestId);
    }
}
