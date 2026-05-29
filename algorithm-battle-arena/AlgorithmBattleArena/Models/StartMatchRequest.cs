using System.Collections.Generic;

namespace AlgorithmBattleArena.Models
{
    /// <summary>
    /// Request body for starting a match in a lobby.
    /// </summary>
    public class StartMatchRequest
    {
        public List<int> ProblemIds { get; set; } = new List<int>();
        public int DurationSec { get; set; }

        /// <summary>
        /// Buffer in seconds to allow clients to receive the broadcast before the start time.
        /// Default 5 seconds.
        /// </summary>
        public int PreparationBufferSec { get; set; } = 5;
    }
}
