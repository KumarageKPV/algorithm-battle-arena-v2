using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AlgorithmBattleArena.Models
{
    public class Auth
    {
        [Key]
        [Required]
        [StringLength(50)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public byte[] PasswordHash { get; set; } = Array.Empty<byte>();

        [Required]
        public byte[] PasswordSalt { get; set; } = Array.Empty<byte>();

        // Navigation properties
        public virtual Student? Student { get; set; }
        public virtual Teacher? Teacher { get; set; }
    }
}
