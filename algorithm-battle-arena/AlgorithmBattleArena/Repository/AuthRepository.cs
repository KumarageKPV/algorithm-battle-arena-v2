using AlgorithmBattleArena.Data;
using AlgorithmBattleArena.Models;
using AlgorithmBattleArena.Dtos;
using AlgorithmBattleArena.Helpers;

namespace AlgorithmBattleArena.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly IDataContextDapper _dapper;
        private readonly AuthHelper _authHelper;

        public AuthRepository(IDataContextDapper dapper, AuthHelper authHelper)
        {
            _dapper = dapper;
            _authHelper = authHelper;
        }

        // Registration
        public bool RegisterStudent(StudentForRegistrationDto studentDto)
        {
            byte[] salt = _authHelper.GetPasswordSalt();
            byte[] hash = _authHelper.GetPasswordHash(studentDto.Password, salt);

            var commands = new List<(string sql, object? parameters)>
            {
                (
                    @"INSERT INTO AlgorithmBattleArinaSchema.Auth (Email, PasswordHash, PasswordSalt) 
                      VALUES (@Email, @PasswordHash, @PasswordSalt)",
                    new { Email = studentDto.Email, PasswordHash = hash, PasswordSalt = salt }
                ),
                (
                    @"INSERT INTO AlgorithmBattleArinaSchema.Student (FirstName, LastName, Email, TeacherId, Active) 
                      VALUES (@FirstName, @LastName, @Email, @TeacherId, 1)",
                    new { studentDto.FirstName, studentDto.LastName, studentDto.Email, studentDto.TeacherId }
                )
            };

            return _dapper.ExecuteTransaction(commands);
        }

        public bool RegisterTeacher(TeacherForRegistrationDto teacherDto)
        {
            byte[] salt = _authHelper.GetPasswordSalt();
            byte[] hash = _authHelper.GetPasswordHash(teacherDto.Password, salt);

            var commands = new List<(string sql, object? parameters)>
            {
                (
                    @"INSERT INTO AlgorithmBattleArinaSchema.Auth (Email, PasswordHash, PasswordSalt) 
                      VALUES (@Email, @PasswordHash, @PasswordSalt)",
                    new { Email = teacherDto.Email, PasswordHash = hash, PasswordSalt = salt }
                ),
                (
                    @"INSERT INTO AlgorithmBattleArinaSchema.Teachers (FirstName, LastName, Email, Active) 
                      VALUES (@FirstName, @LastName, @Email, 1)",
                    new { teacherDto.FirstName, teacherDto.LastName, teacherDto.Email }
                )
            };

            return _dapper.ExecuteTransaction(commands);
        }

        // Fetch methods
        public Auth? GetAuthByEmail(string email)
        {
            string sql = @"SELECT Email, PasswordHash, PasswordSalt 
                           FROM AlgorithmBattleArinaSchema.Auth WHERE Email = @Email";
            return _dapper.LoadDataSingleOrDefault<Auth>(sql, new { Email = email });
        }

        public Student? GetStudentByEmail(string email)
        {
            string sql = @"SELECT StudentId, FirstName, LastName, Email, TeacherId, Active 
                           FROM AlgorithmBattleArinaSchema.Student WHERE Email = @Email";
            return _dapper.LoadDataSingleOrDefault<Student>(sql, new { Email = email });
        }

        public Teacher? GetTeacherByEmail(string email)
        {
            string sql = @"SELECT TeacherId, FirstName, LastName, Email, Active 
                           FROM AlgorithmBattleArinaSchema.Teachers WHERE Email = @Email";
            return _dapper.LoadDataSingleOrDefault<Teacher>(sql, new { Email = email });
        }

        // Utility
        public bool UserExists(string email)
        {
            string sql = @"SELECT COUNT(*) FROM AlgorithmBattleArinaSchema.Auth WHERE Email = @Email";
            int count = _dapper.LoadDataSingle<int>(sql, new { Email = email });
            return count > 0;
        }

        public string GetUserRole(string email)
        {
            if (GetStudentByEmail(email) != null) return "Student";
            if (GetTeacherByEmail(email) != null) return "Teacher";
            return "Unknown";
        }
    }
}    
