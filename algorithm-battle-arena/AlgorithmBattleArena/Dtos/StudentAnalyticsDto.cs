namespace AlgorithmBattleArena.Dtos
{
    public class StudentAnalyticsDto
    {
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int TotalSubmissions { get; set; }
        public int SuccessfulSubmissions { get; set; }
        public decimal SuccessRate { get; set; }
        public int ProblemsAttempted { get; set; }
        public int ProblemsSolved { get; set; }
        public int MatchesParticipated { get; set; }
        public decimal AverageScore { get; set; }
        public string PreferredLanguage { get; set; } = string.Empty;
        public DateTime LastActivity { get; set; }
    }

    public class SubmissionHistoryDto
    {
        public int SubmissionId { get; set; }
        public string ProblemTitle { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int? Score { get; set; }
        public DateTime SubmittedAt { get; set; }
        public string DifficultyLevel { get; set; } = string.Empty;
    }

    public class TeacherDashboardStatsDto
    {
        public int TotalStudents { get; set; }
        public int ActiveStudents { get; set; }
        public int TotalSubmissions { get; set; }
        public decimal OverallSuccessRate { get; set; }
        public List<StudentAnalyticsDto> TopPerformers { get; set; } = new();
    }
}