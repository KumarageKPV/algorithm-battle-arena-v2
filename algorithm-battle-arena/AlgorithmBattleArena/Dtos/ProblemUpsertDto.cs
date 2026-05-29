using System.ComponentModel.DataAnnotations;

namespace AlgorithmBattleArena.Dtos
{
    public class ProblemUpsertDto
    {
        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = null!;
        
        [Required]
        public string Description { get; set; } = null!;
        
        [Required]
        [MaxLength(50)]
        public string DifficultyLevel { get; set; } = null!;
        
        [Required]
        [MaxLength(100)]
        public string Category { get; set; } = null!;
        
        [Range(1, int.MaxValue, ErrorMessage = "Time limit must be greater than 0")]
        public int TimeLimit { get; set; }
        
        [Range(1, int.MaxValue, ErrorMessage = "Memory limit must be greater than 0")]
        public int MemoryLimit { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string CreatedBy { get; set; } = null!;
        
        [Required]
        public string Tags { get; set; } = null!;
        
        [Required]
        public string TestCases { get; set; } = null!; 
        
        [Required]
        public string Solutions { get; set; } = null!; 
    }
}
