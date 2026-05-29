namespace AlgorithmBattleArena.Dtos
{
    public class AdminUserDto
    {
        public string Id { get; set; } = string.Empty; // Prefixed format: "Student:123" or "Teacher:456"
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty; // "Student" or "Teacher"
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
