namespace AlgorithmBattleArena.Dtos
{
    public class LeaderboardEntryDto
    {
        public int Rank { get; set; }
        public string ParticipantEmail { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public int TotalScore { get; set; }
        public int ProblemsCompleted { get; set; }
        public int MatchesPlayed { get; set; }
        public decimal WinRate { get; set; }
        public DateTime? LastSubmission { get; set; }
    }
}
