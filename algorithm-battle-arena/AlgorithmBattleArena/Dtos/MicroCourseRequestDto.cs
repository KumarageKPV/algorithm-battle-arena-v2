using System;

namespace AlgorithmBattleArena.Dtos
{
    public class MicroCourseRequestDto
    {
        // Total match time in seconds (optional)
        public int? TimeLimitSeconds { get; set; }

        // Remaining time for the user in seconds (optional)
        public int? RemainingSec { get; set; }

        // Preferred language or learner language hints (optional)
        public string Language { get; set; } = "";
    }
}
