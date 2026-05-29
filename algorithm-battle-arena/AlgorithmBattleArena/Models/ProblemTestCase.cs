using System.ComponentModel.DataAnnotations;

namespace AlgorithmBattleArena.Models
{
   public class ProblemTestCase
    {
        public int TestCaseId { get; set; }
        
        [Required]
        public int ProblemId { get; set; }
        
        [Required]
        public string InputData { get; set; } = null!;
        
        public string Input => InputData;
        
        [Required]
        public string ExpectedOutput { get; set; } = null!;
        
        public bool IsSample { get; set; } = false;
        
        
        public virtual Problem? Problem { get; set; }
    }
}
