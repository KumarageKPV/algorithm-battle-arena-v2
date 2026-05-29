using System.ComponentModel.DataAnnotations;

namespace AlgorithmBattleArena.Dtos
{
    public class SolutionDto
    {
        [Required]
        [MaxLength(50)]
        public string Language { get; set; } = null!;
        
        [Required]
        public string SolutionText { get; set; } = null!;
    }

}
