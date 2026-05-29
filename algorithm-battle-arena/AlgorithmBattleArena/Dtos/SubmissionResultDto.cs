namespace AlgorithmBattleArena.Dtos
{
    public class SubmissionResultDto
    {
        public int SubmissionId { get; set; }
        public int Score { get; set; }
        public string Status { get; set; } = string.Empty;
        public int PassedCount { get; set; }
        public int TotalCount { get; set; }
        public List<TestCaseResultDto> TestCaseResults { get; set; } = new List<TestCaseResultDto>();
        public DateTime SubmittedAt { get; set; }
    }

    public class TestCaseResultDto
    {
        public int TestCaseIndex { get; set; }
        public bool Passed { get; set; }
        public string ExpectedOutput { get; set; } = string.Empty;
        public string ActualOutput { get; set; } = string.Empty;
        public int ExecutionTime { get; set; }
        public string? Error { get; set; }
    }
}
