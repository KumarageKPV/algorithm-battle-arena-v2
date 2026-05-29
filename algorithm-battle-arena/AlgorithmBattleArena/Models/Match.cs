using System;

namespace AlgorithmBattleArena.Models
{
    public class Match
    {
        public int MatchId { get; set; }
        public int LobbyId { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime? EndedAt { get; set; }
    }
}
