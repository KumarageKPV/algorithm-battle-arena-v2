namespace AlgorithmBattleArena.Dtos
{
    public class LobbyCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public int MaxPlayers { get; set; } = 10;
        public string Mode { get; set; } = "1v1";
        public string Difficulty { get; set; } = "Medium";
    }
}
