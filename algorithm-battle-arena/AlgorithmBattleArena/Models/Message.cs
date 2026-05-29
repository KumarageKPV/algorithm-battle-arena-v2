using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AlgorithmBattleArena.Models
{
    public class Message
    {
        public int MessageId { get; set; }
        
        public int ConversationId { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string SenderEmail { get; set; } = null!;
        
        [Required]
        public string Content { get; set; } = null!;
        
        public DateTime SentAt { get; set; }
        
        [ForeignKey("ConversationId")]
        public virtual Conversation Conversation { get; set; } = null!;
    }
}
