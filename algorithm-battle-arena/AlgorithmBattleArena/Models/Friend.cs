using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AlgorithmBattleArena.Models
{
    public class Friend
    {
        [Key]
        public int FriendshipId { get; set; }

        public int StudentId1 { get; set; }
        public int StudentId2 { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("StudentId1")]
        public virtual Student Student1 { get; set; } = null!;

        [ForeignKey("StudentId2")]
        public virtual Student Student2 { get; set; } = null!;
    }
}
