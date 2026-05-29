using System.ComponentModel.DataAnnotations;

namespace AlgorithmBattleArena.Models
{
    public class AuditLog
    {
        [Key]
        public int Id { get; set; } // Primary key

        public string ActorUserId { get; set; } = string.Empty; // User who performed the action (prefixed: Student:123, Teacher:456)

        public string ActorEmail { get; set; } = string.Empty; // Email of the actor

        public string Action { get; set; } = string.Empty; // Action performed (e.g., "PUT", "POST", "DELETE")

        public string ResourceType { get; set; } = string.Empty; // Type of resource affected (e.g., "User", "Student", "Teacher")

        public string ResourceId { get; set; } = string.Empty; // ID of the affected resource

        public string Details { get; set; } = string.Empty; // JSON details of the action (before/after state, sanitized)

        public DateTime TimestampUtc { get; set; } = DateTime.UtcNow; // When the action occurred (UTC)

        public string SourceIp { get; set; } = string.Empty; // IP address of the request

        public string Route { get; set; } = string.Empty; // API route that was called

        public string CorrelationId { get; set; } = string.Empty; // Request correlation ID for tracing
    }
}
