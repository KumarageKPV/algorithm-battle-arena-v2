using System.Text.Json.Serialization;

namespace AlgorithmBattleArena.Dtos
{
    public class UpdateDifficultyDto
    {
        [JsonPropertyName("difficulty")]
        public string Difficulty { get; set; } = string.Empty;
    }
}
