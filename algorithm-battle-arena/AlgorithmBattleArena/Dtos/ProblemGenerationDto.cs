namespace AlgorithmBattleArena.Dtos
{
    public class ProblemGenerationDto
    {
        public string Language { get; set; } = string.Empty;
        public string Difficulty { get; set; } = string.Empty;
        public int MaxProblems { get; set; }
    }
}
