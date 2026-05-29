using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AlgorithmBattleArena.Models
{
    public class Student
    {
        [Key]
        public int StudentId { get; set; }

        [StringLength(50)]
        public string? FirstName { get; set; }

        [StringLength(50)]
        public string? LastName { get; set; }

        [Required]
        [StringLength(50)]
        public string Email { get; set; } = string.Empty;

        public int? TeacherId { get; set; }

        public bool Active { get; set; } = true;

        
        [ForeignKey("Email")]
        public virtual Auth Auth { get; set; } = null!;

        [ForeignKey("TeacherId")]
        public virtual Teacher? Teacher { get; set; }

        
        [NotMapped]
        public string FullName => $"{FirstName} {LastName}".Trim();
    }
}
