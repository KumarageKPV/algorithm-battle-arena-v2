using System;
using System.Collections.Generic;

namespace AlgorithmBattleArena.Dtos
{
    public class MicroCourseStepDto
    {
        public string? Title { get; set; }
        public int DurationSec { get; set; }
        public string? Content { get; set; }
        public string? Example { get; set; }
        public List<string> Resources { get; set; } = new List<string>();
    }

    public class MicroCourseResponseDto
    {
        public string? MicroCourseId { get; set; }
        public string? Summary { get; set; }
        public List<MicroCourseStepDto> Steps { get; set; } = new List<MicroCourseStepDto>();
        public string? Disclaimer { get; set; }
    }
}
