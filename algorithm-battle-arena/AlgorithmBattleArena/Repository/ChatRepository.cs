using AlgorithmBattleArena.Data;
using AlgorithmBattleArena.Dtos;
using AlgorithmBattleArena.Models;
using Dapper;
using System.Linq;

namespace AlgorithmBattleArena.Repositories
{
    public class ChatRepository : IChatRepository
    {
        private readonly IDataContextDapper _dapper;

        public ChatRepository(IDataContextDapper dapper)
        {
            _dapper = dapper;
        }

        public async Task<int> CreateConversationAsync(string type, int? referenceId, List<string> participantEmails)
        {
            // Check if conversation already exists
            var existingConversation = await GetConversationByTypeAndReference(type, referenceId);
            if (existingConversation != null)
            {
                // Add new participants to existing conversation
                await AddParticipantsToConversationAsync(existingConversation.ConversationId, participantEmails);
                return existingConversation.ConversationId;
            }

            var conversationSql = @"
                INSERT INTO AlgorithmBattleArinaSchema.Conversations (Type, ReferenceId, CreatedAt, UpdatedAt)
                VALUES (@Type, @ReferenceId, GETDATE(), GETDATE());
                SELECT SCOPE_IDENTITY();";

            var conversationId = await _dapper.LoadDataSingleAsync<int>(conversationSql, new { Type = type, ReferenceId = referenceId });

            try
            {
                await AddParticipantsToConversationAsync(conversationId, participantEmails);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to add participants to conversation: {ex.Message}", ex);
            }

            return conversationId;
        }

        public async Task AddParticipantsToConversationAsync(int conversationId, List<string> participantEmails)
        {
            foreach (var email in participantEmails)
            {
                try
                {
                    var participantSql = @"
                        IF NOT EXISTS (SELECT 1 FROM AlgorithmBattleArinaSchema.ConversationParticipants 
                                      WHERE ConversationId = @ConversationId AND ParticipantEmail = @ParticipantEmail)
                        INSERT INTO AlgorithmBattleArinaSchema.ConversationParticipants (ConversationId, ParticipantEmail, JoinedAt)
                        VALUES (@ConversationId, @ParticipantEmail, GETDATE())";
                    
                    await _dapper.ExecuteSqlAsync(participantSql, new { ConversationId = conversationId, ParticipantEmail = email });
                }
                catch
                {
                    // Ignore duplicate participant errors
                }
            }
        }

        public async Task<IEnumerable<ConversationDto>> GetConversationsAsync(string userEmail)
        {
            var sql = @"
                SELECT c.ConversationId, c.Type, c.ReferenceId, c.CreatedAt, c.UpdatedAt
                FROM AlgorithmBattleArinaSchema.Conversations c
                WHERE c.ConversationId IN (
                    SELECT ConversationId FROM AlgorithmBattleArinaSchema.ConversationParticipants WHERE ParticipantEmail = @UserEmail
                )
                ORDER BY c.UpdatedAt DESC";

            var conversations = await _dapper.LoadDataAsync<ConversationDto>(sql, new { UserEmail = userEmail });
            
            // Get participants for each conversation in a single query for better performance
            if (conversations.Any())
            {
                var conversationIds = conversations.Select(c => c.ConversationId).ToList();
                var participantsSql = @"
                    SELECT ConversationId, ParticipantEmail 
                    FROM AlgorithmBattleArinaSchema.ConversationParticipants 
                    WHERE ConversationId IN @ConversationIds";
                
                var allParticipants = await _dapper.LoadDataAsync<dynamic>(participantsSql, new { ConversationIds = conversationIds });
                var participantGroups = allParticipants.GroupBy(p => (int)p.ConversationId)
                    .ToDictionary(g => g.Key, g => g.Select(p => (string)p.ParticipantEmail).ToList());
                
                foreach (var conv in conversations)
                {
                    conv.Participants = participantGroups.GetValueOrDefault(conv.ConversationId, new List<string>());
                }
            }

            return conversations;
        }

        public async Task<ConversationDto?> GetConversationAsync(int conversationId)
        {
            var sql = @"
                SELECT c.ConversationId, c.Type, c.ReferenceId, c.CreatedAt, c.UpdatedAt,
                       STRING_AGG(cp.ParticipantEmail, ',') as ParticipantEmails
                FROM AlgorithmBattleArinaSchema.Conversations c
                INNER JOIN AlgorithmBattleArinaSchema.ConversationParticipants cp ON c.ConversationId = cp.ConversationId
                WHERE c.ConversationId = @ConversationId
                GROUP BY c.ConversationId, c.Type, c.ReferenceId, c.CreatedAt, c.UpdatedAt";

            var conv = await _dapper.LoadDataSingleOrDefaultAsync<dynamic>(sql, new { ConversationId = conversationId });
            if (conv == null) return null;

            return new ConversationDto
            {
                ConversationId = conv.ConversationId,
                Type = conv.Type,
                ReferenceId = conv.ReferenceId,
                CreatedAt = conv.CreatedAt,
                UpdatedAt = conv.UpdatedAt,
                Participants = conv.ParticipantEmails?.ToString()?.Split(',').ToList() ?? new List<string>()
            };
        }

        public async Task<int> SendMessageAsync(int conversationId, string senderEmail, string content)
        {
            try
            {
                var sql = @"
                    INSERT INTO AlgorithmBattleArinaSchema.Messages (ConversationId, SenderEmail, Content, SentAt)
                    VALUES (@ConversationId, @SenderEmail, @Content, GETDATE());
                    
                    UPDATE AlgorithmBattleArinaSchema.Conversations 
                    SET UpdatedAt = GETDATE() 
                    WHERE ConversationId = @ConversationId;
                    
                    SELECT SCOPE_IDENTITY();";

                return await _dapper.LoadDataSingleAsync<int>(sql, new { ConversationId = conversationId, SenderEmail = senderEmail, Content = content });
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to send message: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<MessageDto>> GetMessagesAsync(int conversationId, int pageSize = 50, int offset = 0)
        {
            var sql = @"
                SELECT m.MessageId, m.ConversationId, m.SenderEmail, m.Content, m.SentAt,
                       COALESCE(s.FirstName + ' ' + s.LastName, t.FirstName + ' ' + t.LastName, 'Admin') as SenderName
                FROM AlgorithmBattleArinaSchema.Messages m
                LEFT JOIN AlgorithmBattleArinaSchema.Student s ON m.SenderEmail = s.Email
                LEFT JOIN AlgorithmBattleArinaSchema.Teachers t ON m.SenderEmail = t.Email
                WHERE m.ConversationId = @ConversationId
                ORDER BY m.SentAt DESC
                OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY";

            return await _dapper.LoadDataAsync<MessageDto>(sql, new { ConversationId = conversationId, PageSize = pageSize, Offset = offset });
        }

        public async Task<bool> IsParticipantAsync(int conversationId, string userEmail)
        {
            var sql = @"
                SELECT COUNT(1) FROM AlgorithmBattleArinaSchema.ConversationParticipants 
                WHERE ConversationId = @ConversationId AND ParticipantEmail = @UserEmail";

            var count = await _dapper.LoadDataSingleAsync<int>(sql, new { ConversationId = conversationId, UserEmail = userEmail });
            return count > 0;
        }

        public async Task<ConversationDto?> GetFriendConversationAsync(string user1Email, string user2Email)
        {
            var sql = @"
                SELECT c.ConversationId, c.Type, c.ReferenceId, c.CreatedAt, c.UpdatedAt
                FROM AlgorithmBattleArinaSchema.Conversations c
                WHERE c.Type = 'Friend' AND c.ReferenceId IS NULL
                AND c.ConversationId IN (
                    SELECT cp1.ConversationId FROM AlgorithmBattleArinaSchema.ConversationParticipants cp1
                    WHERE cp1.ParticipantEmail = @User1Email
                    AND EXISTS (
                        SELECT 1 FROM AlgorithmBattleArinaSchema.ConversationParticipants cp2
                        WHERE cp2.ConversationId = cp1.ConversationId AND cp2.ParticipantEmail = @User2Email
                    )
                )";

            var conv = await _dapper.LoadDataSingleOrDefaultAsync<dynamic>(sql, new { User1Email = user1Email, User2Email = user2Email });
            if (conv == null) return null;

            return new ConversationDto
            {
                ConversationId = conv.ConversationId,
                Type = conv.Type,
                ReferenceId = conv.ReferenceId,
                CreatedAt = conv.CreatedAt,
                UpdatedAt = conv.UpdatedAt,
                Participants = new List<string> { user1Email, user2Email }
            };
        }

        public async Task<ConversationDto?> GetLobbyConversationAsync(int lobbyId)
        {
            return await GetConversationByTypeAndReference("Lobby", lobbyId);
        }

        public async Task<ConversationDto?> GetMatchConversationAsync(int matchId)
        {
            return await GetConversationByTypeAndReference("Match", matchId);
        }

        private async Task<ConversationDto?> GetConversationByTypeAndReference(string type, int? referenceId)
        {
            var sql = @"
                SELECT ConversationId, Type, ReferenceId, CreatedAt, UpdatedAt
                FROM AlgorithmBattleArinaSchema.Conversations
                WHERE Type = @Type AND ReferenceId = @ReferenceId";

            var conv = await _dapper.LoadDataSingleOrDefaultAsync<dynamic>(sql, new { Type = type, ReferenceId = referenceId });
            if (conv == null) return null;

            return new ConversationDto
            {
                ConversationId = conv.ConversationId,
                Type = conv.Type,
                ReferenceId = conv.ReferenceId,
                CreatedAt = conv.CreatedAt,
                UpdatedAt = conv.UpdatedAt
            };
        }
    }
}
