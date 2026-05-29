
using System;
using System.Collections.Generic;

namespace AlgorithmBattleArena.Models
{
    public class Lobby
    {
        public int LobbyId { get; set; }
        public string LobbyCode { get; set; } = "";
        public string HostEmail { get; set; } = "";
        public string LobbyName { get; set; } = "";
        public bool IsPublic { get; set; }
        public int MaxPlayers { get; set; }
        public string Mode { get; set; } = "";
        public string Difficulty { get; set; } = "";
        public string? Category { get; set; }
        public string Status { get; set; } = "";
        public DateTime CreatedAt { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? EndedAt { get; set; }
        public List<LobbyParticipant> Participants { get; set; } = new List<LobbyParticipant>();
    }
}
