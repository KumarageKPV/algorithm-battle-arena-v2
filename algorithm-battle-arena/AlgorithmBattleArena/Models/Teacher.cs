using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AlgorithmBattleArena.Models
{
    public class Teacher
    {
        [Key]
        public int TeacherId { get; set; }

        [StringLength(50)]
        public string? FirstName { get; set; }

        [StringLength(50)]
        public string? LastName { get; set; }

        [Required]
        [StringLength(50)]
        public string Email { get; set; } = string.Empty;

        public bool Active { get; set; } = true;

       
        [ForeignKey("Email")]
        public virtual Auth Auth { get; set; } = null!;

        public virtual ICollection<Student> Students { get; set; } = new List<Student>();

        
        [NotMapped]
        public string FullName => $"{FirstName} {LastName}".Trim();
    }
}
