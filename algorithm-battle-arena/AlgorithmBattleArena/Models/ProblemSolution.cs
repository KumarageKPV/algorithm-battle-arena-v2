using System.ComponentModel.DataAnnotations;

namespace AlgorithmBattleArena.Models
{
   public class ProblemSolution
    {
        public int SolutionId { get; set; }
        
        [Required]
        public int ProblemId { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string Language { get; set; } = null!;
        
        [Required]
        public string SolutionText { get; set; } = null!;
        
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        
        public virtual Problem? Problem { get; set; }
    }

}
