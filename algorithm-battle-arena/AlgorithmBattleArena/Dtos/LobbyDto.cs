namespace AlgorithmBattleArena.Dtos
{
    public class LobbyDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;

        public int MemberCount { get; set; }
        public bool IsActive { get; set; }
    }
}
