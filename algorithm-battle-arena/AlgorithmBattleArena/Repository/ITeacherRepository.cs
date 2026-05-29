using System.Collections.Generic;
using System.Threading.Tasks;
using AlgorithmBattleArena.Models;

namespace AlgorithmBattleArena.Repositories
{
    public interface ITeacherRepository
    {
        Task<IEnumerable<Teacher>> GetTeachers();
        Task<bool> ExistsAsync(int teacherId);
    }
}
