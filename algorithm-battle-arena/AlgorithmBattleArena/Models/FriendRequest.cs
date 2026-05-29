using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AlgorithmBattleArena.Models
{
    public class FriendRequest
    {
        [Key]
        public int RequestId { get; set; }

        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        public string Status { get; set; } = "Pending";
        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
        public DateTime? RespondedAt { get; set; }

        [ForeignKey("SenderId")]
        public virtual Student Sender { get; set; } = null!;

        [ForeignKey("ReceiverId")]
        public virtual Student Receiver { get; set; } = null!;
    }
}
