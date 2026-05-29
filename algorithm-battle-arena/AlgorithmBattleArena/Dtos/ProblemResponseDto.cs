using AlgorithmBattleArena.Models;

namespace AlgorithmBattleArena.Dtos
{
    public class ProblemResponseDto
    {
        public int ProblemId { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string DifficultyLevel { get; set; } = null!;
        public string Category { get; set; } = null!;
        public int TimeLimit { get; set; }
        public int MemoryLimit { get; set; }
        public string CreatedBy { get; set; } = null!;
        public string Tags { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<ProblemTestCase> TestCases { get; set; } = new();
        public List<ProblemSolution> Solutions { get; set; } = new();
    }
}
