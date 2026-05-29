namespace AlgorithmBattleArena.Dtos
{
    public class UserStatisticsDto
    {
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public int Rank { get; set; }
        public int MatchesPlayed { get; set; }
        public decimal WinRate { get; set; }
        public int ProblemsCompleted { get; set; }
        public int TotalScore { get; set; }
        public DateTime? LastActivity { get; set; }
    }
}
