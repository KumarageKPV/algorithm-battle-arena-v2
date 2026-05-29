namespace AlgorithmBattleArena.Dtos
{
    public class ConversationDto
    {
        public int ConversationId { get; set; }
        public string Type { get; set; } = string.Empty;
        public int? ReferenceId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<string> Participants { get; set; } = new();
        public MessageDto? LastMessage { get; set; }
    }

    public class MessageDto
    {
        public int MessageId { get; set; }
        public int ConversationId { get; set; }
        public string SenderEmail { get; set; } = string.Empty;
        public string SenderName { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime SentAt { get; set; }
    }

    public class SendMessageDto
    {
        public string Content { get; set; } = string.Empty;
    }

    public class CreateConversationDto
    {
        public string Type { get; set; } = string.Empty;
        public int? ReferenceId { get; set; }
        public List<string> ParticipantEmails { get; set; } = new();
    }

    public class CreateFriendConversationDto
    {
        public int FriendId { get; set; }
        public string FriendEmail { get; set; } = string.Empty;
    }
}
