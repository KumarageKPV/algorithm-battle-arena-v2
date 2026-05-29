using System;

namespace AlgorithmBattleArena.Models
{
    public class Submission
    {
        public int SubmissionId { get; set; }
        public int MatchId { get; set; }
        public int ProblemId { get; set; }
        public string ParticipantEmail { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int? Score { get; set; }
        public DateTime SubmittedAt { get; set; }
    }
}
