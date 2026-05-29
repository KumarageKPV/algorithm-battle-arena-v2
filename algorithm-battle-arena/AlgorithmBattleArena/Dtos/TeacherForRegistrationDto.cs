using System.ComponentModel.DataAnnotations;

namespace AlgorithmBattleArena.Dtos
{
    public class TeacherForRegistrationDto
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

        
        //Role field to distinguish between Student and Teacher registration
        [Required]
        public string Role { get; set; } = "Student"; 
    }
}
