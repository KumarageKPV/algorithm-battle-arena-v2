using AlgorithmBattleArena.Models;
using AlgorithmBattleArena.Dtos;

namespace AlgorithmBattleArena.Repositories
{
    public interface IAuthRepository
    {
        // Registration
        bool RegisterStudent(StudentForRegistrationDto studentDto);
        bool RegisterTeacher(TeacherForRegistrationDto teacherDto);

        // Fetch
        Auth? GetAuthByEmail(string email);
        Student? GetStudentByEmail(string email);
        Teacher? GetTeacherByEmail(string email);

        // Utility
        bool UserExists(string email);
        string GetUserRole(string email);
    }
}
