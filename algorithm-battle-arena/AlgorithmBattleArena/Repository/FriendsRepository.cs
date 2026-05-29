using AlgorithmBattleArena.Data;
using AlgorithmBattleArena.Dtos;
using Dapper;

namespace AlgorithmBattleArena.Repositories
{
    public class FriendsRepository : IFriendsRepository
    {
        private readonly IDataContextDapper _dapper;

        public FriendsRepository(IDataContextDapper dapper)
        {
            _dapper = dapper;
        }

        public async Task<IEnumerable<FriendDto>> GetFriendsAsync(int studentId)
        {
            var sql = @"
                SELECT s.StudentId, s.FirstName + ' ' + s.LastName AS FullName, s.Email, f.CreatedAt AS FriendsSince
                FROM AlgorithmBattleArinaSchema.Friends f
                JOIN AlgorithmBattleArinaSchema.Student s ON 
                    (f.StudentId1 = @StudentId AND s.StudentId = f.StudentId2) OR
                    (f.StudentId2 = @StudentId AND s.StudentId = f.StudentId1)
                WHERE f.StudentId1 = @StudentId OR f.StudentId2 = @StudentId";

            return await _dapper.LoadDataAsync<FriendDto>(sql, new { StudentId = studentId });
        }

        public async Task<IEnumerable<FriendDto>> SearchStudentsAsync(string query, int currentStudentId)
        {
            var sql = @"
                SELECT s.StudentId, s.FirstName + ' ' + s.LastName AS FullName, s.Email
                FROM AlgorithmBattleArinaSchema.Student s
                WHERE s.StudentId != @CurrentStudentId 
                AND s.Active = 1
                AND (s.FirstName LIKE @Query OR s.LastName LIKE @Query OR s.Email LIKE @Query)
                AND NOT EXISTS (
                    SELECT 1 FROM AlgorithmBattleArinaSchema.Friends f 
                    WHERE (f.StudentId1 = @CurrentStudentId AND f.StudentId2 = s.StudentId)
                    OR (f.StudentId2 = @CurrentStudentId AND f.StudentId1 = s.StudentId)
                )
                AND NOT EXISTS (
                    SELECT 1 FROM AlgorithmBattleArinaSchema.FriendRequests fr
                    WHERE ((fr.SenderId = @CurrentStudentId AND fr.ReceiverId = s.StudentId)
                    OR (fr.SenderId = s.StudentId AND fr.ReceiverId = @CurrentStudentId))
                    AND fr.Status = 'Pending'
                )";

            return await _dapper.LoadDataAsync<FriendDto>(sql, new { 
                Query = $"%{query}%", 
                CurrentStudentId = currentStudentId 
            });
        }

        public async Task<int> SendFriendRequestAsync(int senderId, int receiverId)
        {
            var sql = @"
                INSERT INTO AlgorithmBattleArinaSchema.FriendRequests (SenderId, ReceiverId, Status, RequestedAt)
                VALUES (@SenderId, @ReceiverId, 'Pending', GETDATE());
                SELECT SCOPE_IDENTITY();";

            return await _dapper.LoadDataSingleAsync<int>(sql, new { SenderId = senderId, ReceiverId = receiverId });
        }

        public async Task<IEnumerable<FriendRequestDto>> GetReceivedRequestsAsync(int studentId)
        {
            var sql = @"
                SELECT fr.RequestId, fr.SenderId, fr.ReceiverId, 
                       s.FirstName + ' ' + s.LastName AS SenderName, s.Email AS SenderEmail,
                       fr.Status, fr.RequestedAt
                FROM AlgorithmBattleArinaSchema.FriendRequests fr
                JOIN AlgorithmBattleArinaSchema.Student s ON fr.SenderId = s.StudentId
                WHERE fr.ReceiverId = @StudentId AND fr.Status = 'Pending'";

            return await _dapper.LoadDataAsync<FriendRequestDto>(sql, new { StudentId = studentId });
        }

        public async Task<IEnumerable<FriendRequestDto>> GetSentRequestsAsync(int studentId)
        {
            var sql = @"
                SELECT fr.RequestId, fr.SenderId, fr.ReceiverId,
                       s.FirstName + ' ' + s.LastName AS ReceiverName, s.Email AS ReceiverEmail,
                       fr.Status, fr.RequestedAt
                FROM AlgorithmBattleArinaSchema.FriendRequests fr
                JOIN AlgorithmBattleArinaSchema.Student s ON fr.ReceiverId = s.StudentId
                WHERE fr.SenderId = @StudentId";

            return await _dapper.LoadDataAsync<FriendRequestDto>(sql, new { StudentId = studentId });
        }

        public async Task<FriendRequestDto?> GetFriendRequestAsync(int requestId)
        {
            var sql = @"
                SELECT fr.RequestId, fr.SenderId, fr.ReceiverId,
                       s.FirstName + ' ' + s.LastName AS SenderName, s.Email AS SenderEmail,
                       fr.Status, fr.RequestedAt
                FROM AlgorithmBattleArinaSchema.FriendRequests fr
                JOIN AlgorithmBattleArinaSchema.Student s ON fr.SenderId = s.StudentId
                WHERE fr.RequestId = @RequestId";

            return await _dapper.LoadDataSingleOrDefaultAsync<FriendRequestDto>(sql, new { RequestId = requestId });
        }

        public async Task AcceptFriendRequestAsync(int requestId, int studentId)
        {
            var sql = @"
                DECLARE @SenderId INT, @ReceiverId INT;
                
                SELECT @SenderId = SenderId, @ReceiverId = ReceiverId 
                FROM AlgorithmBattleArinaSchema.FriendRequests 
                WHERE RequestId = @RequestId AND ReceiverId = @StudentId;
                
                UPDATE AlgorithmBattleArinaSchema.FriendRequests 
                SET Status = 'Accepted', RespondedAt = GETDATE()
                WHERE RequestId = @RequestId;
                
                INSERT INTO AlgorithmBattleArinaSchema.Friends (StudentId1, StudentId2, CreatedAt)
                VALUES (@SenderId, @ReceiverId, GETDATE());";

            await _dapper.ExecuteSqlAsync(sql, new { RequestId = requestId, StudentId = studentId });
        }

        public async Task RejectFriendRequestAsync(int requestId, int studentId)
        {
            var sql = @"
                UPDATE AlgorithmBattleArinaSchema.FriendRequests 
                SET Status = 'Rejected', RespondedAt = GETDATE()
                WHERE RequestId = @RequestId AND ReceiverId = @StudentId";

            await _dapper.ExecuteSqlAsync(sql, new { RequestId = requestId, StudentId = studentId });
        }

        public async Task RemoveFriendAsync(int studentId, int friendId)
        {
            var sql = @"
                DELETE FROM AlgorithmBattleArinaSchema.Friends 
                WHERE (StudentId1 = @StudentId AND StudentId2 = @FriendId)
                OR (StudentId1 = @FriendId AND StudentId2 = @StudentId)";

            await _dapper.ExecuteSqlAsync(sql, new { StudentId = studentId, FriendId = friendId });
        }

        public async Task<(string senderEmail, string receiverEmail)?> GetFriendRequestEmailsAsync(int requestId)
        {
            var sql = @"
                SELECT s1.Email as SenderEmail, s2.Email as ReceiverEmail
                FROM AlgorithmBattleArinaSchema.FriendRequests fr
                JOIN AlgorithmBattleArinaSchema.Student s1 ON fr.SenderId = s1.StudentId
                JOIN AlgorithmBattleArinaSchema.Student s2 ON fr.ReceiverId = s2.StudentId
                WHERE fr.RequestId = @RequestId";

            var result = await _dapper.LoadDataSingleOrDefaultAsync<dynamic>(sql, new { RequestId = requestId });
            if (result == null) return null;
            
            return (result.SenderEmail, result.ReceiverEmail);
        }
    }
}
