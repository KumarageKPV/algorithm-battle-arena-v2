using System.ComponentModel.DataAnnotations;

namespace AlgorithmBattleArena.Dtos
{
    public class TestCaseDto
    {
        [Required]
        public string InputData { get; set; } = null!;
        
        [Required]
        public string ExpectedOutput { get; set; } = null!;
        
        public bool IsSample { get; set; }
    }

}
