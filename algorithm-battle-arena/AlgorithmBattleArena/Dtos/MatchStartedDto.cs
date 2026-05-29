using System;
using System.Collections.Generic;

namespace AlgorithmBattleArena.Dtos
{
    /// <summary>
    /// Payload sent to clients when a match starts.
    /// All times are UTC.
    /// </summary>
    public class MatchStartedDto
    {
        public int MatchId { get; set; }
        public List<int> ProblemIds { get; set; } = new List<int>();

        /// <summary>
        /// Absolute UTC start time for the match. Clients should compute countdowns off this value.
        /// </summary>
        public DateTime StartAtUtc { get; set; }

        /// <summary>
        /// Match duration in seconds.
        /// </summary>
        public int DurationSec { get; set; }

        /// <summary>
        /// Optional: time the server sent the message. Useful for latency measurement in staging.
        /// </summary>
        public DateTime SentAtUtc { get; set; }
    }
}
