namespace AlgorithmBattleArena.Dtos
{
    public class ProblemFilterDto
    {
        public string? Category { get; set; }
        public string? DifficultyLevel { get; set; }
        public string? SearchTerm { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
