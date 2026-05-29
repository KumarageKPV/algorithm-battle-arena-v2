
using System;

namespace AlgorithmBattleArena.Models
{
    public class LobbyParticipant
    {
        public int LobbyParticipantId { get; set; }
        public int LobbyId { get; set; }
        public string ParticipantEmail { get; set; } = "";
        public string Role { get; set; } = "";
        public DateTime JoinedAt { get; set; }
    }
}
