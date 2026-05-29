using AlgorithmBattleArena.Data;
using AlgorithmBattleArena.Dtos;
using AlgorithmBattleArena.Helpers;
using Dapper;

namespace AlgorithmBattleArena.Repositories
{
    public class AdminRepository : IAdminRepository
    {
        private readonly IDataContextDapper _dapper;

        public AdminRepository(IDataContextDapper dapper)
        {
            _dapper = dapper;
        }

        public async Task<PagedResult<AdminUserDto>> GetUsersAsync(string? q, string? role, int page, int pageSize)
        {
            var whereClause = "";
            var parameters = new DynamicParameters();
            
            if (!string.IsNullOrEmpty(q))
            {
                whereClause = " WHERE FirstName LIKE @Search OR LastName LIKE @Search OR Email LIKE @Search";
                parameters.Add("@Search", $"%{q}%");
            }

            var offset = (page - 1) * pageSize;
            parameters.Add("@Offset", offset);
            parameters.Add("@PageSize", pageSize);

            var users = new List<AdminUserDto>();
            int totalCount = 0;

            // Get students if no role filter or role is "Student"
            if (string.IsNullOrEmpty(role) || role == "Student")
            {
                var countSql = $"SELECT COUNT(*) FROM AlgorithmBattleArinaSchema.Student{whereClause}";
                var studentCount = await _dapper.LoadDataSingleAsync<int>(countSql, parameters);
                totalCount += studentCount;

                var studentSql = $@"
                    SELECT StudentId, FirstName, LastName, Email, Active 
                    FROM AlgorithmBattleArinaSchema.Student{whereClause}
                    ORDER BY StudentId
                    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY";

                var students = await _dapper.LoadDataAsync<dynamic>(studentSql, parameters);
                users.AddRange(students.Select(s => new AdminUserDto
                {
                    Id = $"Student:{s.StudentId}",
                    Name = $"{s.FirstName} {s.LastName}".Trim(),
                    Email = s.Email,
                    Role = "Student",
                    IsActive = s.Active,
                    CreatedAt = DateTime.UtcNow
                }));
            }

            // Get teachers if no role filter or role is "Teacher"
            if (string.IsNullOrEmpty(role) || role == "Teacher")
            {
                var countSql = $"SELECT COUNT(*) FROM AlgorithmBattleArinaSchema.Teachers{whereClause}";
                var teacherCount = await _dapper.LoadDataSingleAsync<int>(countSql, parameters);
                totalCount += teacherCount;

                var teacherSql = $@"
                    SELECT TeacherId, FirstName, LastName, Email, Active 
                    FROM AlgorithmBattleArinaSchema.Teachers{whereClause}
                    ORDER BY TeacherId
                    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY";

                var teachers = await _dapper.LoadDataAsync<dynamic>(teacherSql, parameters);
                users.AddRange(teachers.Select(t => new AdminUserDto
                {
                    Id = $"Teacher:{t.TeacherId}",
                    Name = $"{t.FirstName} {t.LastName}".Trim(),
                    Email = t.Email,
                    Role = "Teacher",
                    IsActive = t.Active,
                    CreatedAt = DateTime.UtcNow
                }));
            }

            return new PagedResult<AdminUserDto>
            {
                Items = users.OrderBy(u => u.Role).ThenBy(u => u.Name).ToList(),
                Total = totalCount
            };
        }

        public async Task<AdminUserDto?> ToggleUserActiveAsync(string id, bool deactivate)
        {
            var (role, numericId) = ParseUserId(id);
            if (string.IsNullOrEmpty(role) || numericId == 0)
                return null;

            if (role == "Student")
            {
                const string sql = @"
                    UPDATE AlgorithmBattleArinaSchema.Student 
                    SET Active = @Active 
                    WHERE StudentId = @Id;
                    
                    SELECT StudentId, FirstName, LastName, Email, Active 
                    FROM AlgorithmBattleArinaSchema.Student 
                    WHERE StudentId = @Id";

                var student = await _dapper.LoadDataSingleOrDefaultAsync<dynamic>(sql, new 
                { 
                    Active = !deactivate, 
                    Id = numericId 
                });

                if (student == null) return null;

                return new AdminUserDto
                {
                    Id = $"Student:{student.StudentId}",
                    Name = $"{student.FirstName} {student.LastName}".Trim(),
                    Email = student.Email,
                    Role = "Student",
                    IsActive = student.Active,
                    CreatedAt = DateTime.UtcNow
                };
            }
            else if (role == "Teacher")
            {
                const string sql = @"
                    UPDATE AlgorithmBattleArinaSchema.Teachers 
                    SET Active = @Active 
                    WHERE TeacherId = @Id;
                    
                    SELECT TeacherId, FirstName, LastName, Email, Active 
                    FROM AlgorithmBattleArinaSchema.Teachers 
                    WHERE TeacherId = @Id";

                var teacher = await _dapper.LoadDataSingleOrDefaultAsync<dynamic>(sql, new 
                { 
                    Active = !deactivate, 
                    Id = numericId 
                });

                if (teacher == null) return null;

                return new AdminUserDto
                {
                    Id = $"Teacher:{teacher.TeacherId}",
                    Name = $"{teacher.FirstName} {teacher.LastName}".Trim(),
                    Email = teacher.Email,
                    Role = "Teacher",
                    IsActive = teacher.Active,
                    CreatedAt = DateTime.UtcNow
                };
            }

            return null;
        }

        private (string role, int id) ParseUserId(string userId)
        {
            if (userId.Contains(':'))
            {
                var parts = userId.Split(':');
                if (parts.Length == 2 && int.TryParse(parts[1], out int id))
                {
                    return (parts[0], id);
                }
            }
            return ("", 0);
        }
    }
}
