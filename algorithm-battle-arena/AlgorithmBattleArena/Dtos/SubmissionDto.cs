namespace AlgorithmBattleArena.Dtos
{
    public class SubmissionDto
    {
        public int MatchId { get; set; }
        public int ProblemId { get; set; }
        public string Language { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public int? Score { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
