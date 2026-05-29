using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AlgorithmBattleArena.Models
{
    public class ConversationParticipant
    {
        public int ConversationParticipantId { get; set; }
        
        public int ConversationId { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string ParticipantEmail { get; set; } = null!;
        
        public DateTime JoinedAt { get; set; }
        
        [ForeignKey("ConversationId")]
        public virtual Conversation Conversation { get; set; } = null!;
    }
}
