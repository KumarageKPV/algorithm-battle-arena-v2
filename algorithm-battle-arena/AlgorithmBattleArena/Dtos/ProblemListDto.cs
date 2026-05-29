namespace AlgorithmBattleArena.Dtos
{
    public class ProblemListDto
    {
        public int ProblemId { get; set; }
        public string Title { get; set; } = null!;
        public string DifficultyLevel { get; set; } = null!;
        public string Category { get; set; } = null!;
        public string CreatedBy { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
    }
}
