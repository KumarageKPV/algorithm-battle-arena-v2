namespace AlgorithmBattleArena.Dtos
{
    public class FriendDto
    {
        public int StudentId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool IsOnline { get; set; } = false;
        public DateTime FriendsSince { get; set; }
    }

    public class FriendRequestDto
    {
        public int RequestId { get; set; }
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public string SenderEmail { get; set; } = string.Empty;
        public string ReceiverName { get; set; } = string.Empty;
        public string ReceiverEmail { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime RequestedAt { get; set; }
    }

    public class SendFriendRequestDto
    {
        public int ReceiverId { get; set; }
    }
}
