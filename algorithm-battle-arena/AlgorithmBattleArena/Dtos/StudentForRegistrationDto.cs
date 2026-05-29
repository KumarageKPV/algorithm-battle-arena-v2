using System.ComponentModel.DataAnnotations;

namespace AlgorithmBattleArena.Dtos
{
    public class StudentForRegistrationDto
    {
        [Required]
        [EmailAddress]
        [StringLength(50)]
        public string Email { get; set; } = "";

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string Password { get; set; } = "";

        [Required]
        [Compare("Password", ErrorMessage = "Passwords do not match")]
        public string PasswordConfirm { get; set; } = "";

        [Required]
        [StringLength(50)]
        public string FirstName { get; set; } = "";

        [Required]
        [StringLength(50)]
        public string LastName { get; set; } = "";

        public int? TeacherId { get; set; }

        
        [Required]
        public string Role { get; set; } = "Student"; 
    }
}
