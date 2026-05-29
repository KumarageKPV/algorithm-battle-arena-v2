namespace AlgorithmBattleArena.Dtos
{
    public class StudentRequestDto
    {
        public int RequestId { get; set; }
        public int StudentId { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
    }
}
