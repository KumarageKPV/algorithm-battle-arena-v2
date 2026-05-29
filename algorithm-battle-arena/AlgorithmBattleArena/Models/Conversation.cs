using System.ComponentModel.DataAnnotations;

namespace AlgorithmBattleArena.Models
{
    public class Conversation
    {
        public int ConversationId { get; set; }
        
        [Required]
        [MaxLength(20)]
        public string Type { get; set; } = null!;
        
        public int? ReferenceId { get; set; }
        
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        
        public virtual ICollection<ConversationParticipant> Participants { get; set; } = new List<ConversationParticipant>();
        public virtual ICollection<Message> Messages { get; set; } = new List<Message>();
    }
}
